#include "Win.h"
#include "Util.h"
#include <format>
#include <windowsx.h>
#include <dwmapi.h>
#include <WebView2.h>
#include "App.h"

using namespace Microsoft::WRL;

Win::Win()
{
    initSizeAndPos();
    initWindow();
    createPageController();
}

Win::~Win()
{
    webview->Release();
    ctrl->Release();
}


void Win::initSizeAndPos()
{
    w = 1200;
    h = 800;
    RECT rect;
    SystemParametersInfo(SPI_GETWORKAREA, 0, &rect, 0);
    x = (rect.right - w) / 2;
    y = (rect.bottom - h) / 2;
}
void Win::initWindow()
{
    auto hinstance = GetModuleHandle(NULL);
    static int num = 0;
    WNDCLASSEX wcx{};
    wcx.cbSize = sizeof(wcx);
    wcx.style = CS_HREDRAW | CS_VREDRAW;
    wcx.lpfnWndProc = &Win::RouteWindowMessage;
    wcx.cbWndExtra = sizeof(Win*);
    wcx.hInstance = hinstance;
    wcx.hIcon = LoadIcon(NULL, IDI_APPLICATION);
    wcx.hCursor = LoadCursor(NULL, IDC_ARROW);
    wcx.hbrBackground = (HBRUSH)(COLOR_WINDOW + 1);
    auto clsName = std::format(L"wv2js_{}", num++);
    wcx.lpszClassName = clsName.c_str();
    if (!RegisterClassEx(&wcx))
    {
        MessageBox(NULL, L"注册窗口类失败", L"系统提示", NULL);
        return;
    }
    hwnd = CreateWindowEx(NULL, wcx.lpszClassName, L"Poster", WS_VISIBLE | WS_OVERLAPPEDWINDOW | WS_CLIPCHILDREN,
        x, y, w, h, NULL, NULL, hinstance, static_cast<LPVOID>(this));
    DWMNCRENDERINGPOLICY policy = DWMNCRP_ENABLED;
    DwmSetWindowAttribute(hwnd, DWMWA_NCRENDERING_POLICY, &policy, sizeof(policy));
    MARGINS margins = { 1,1,1,1 };
    DwmExtendFrameIntoClientArea(hwnd, &margins);
}

LRESULT CALLBACK Win::RouteWindowMessage(HWND hWnd, UINT msg, WPARAM wParam, LPARAM lParam) {
    if (msg == WM_NCCREATE)
    {
        CREATESTRUCT* pCS = reinterpret_cast<CREATESTRUCT*>(lParam);
        LPVOID pThis = pCS->lpCreateParams;
        SetWindowLongPtr(hWnd, GWLP_USERDATA, reinterpret_cast<LONG_PTR>(pThis));
        auto that = static_cast<Win*>(pThis);
        that->hwnd = hWnd;
    }
    else if (auto obj = reinterpret_cast<Win*>(GetWindowLongPtr(hWnd, GWLP_USERDATA))) {
        return obj->wndProc(hWnd, msg, wParam, lParam);
    }
    return DefWindowProc(hWnd, msg, wParam, lParam);
}

LRESULT CALLBACK Win::wndProc(HWND hWnd, UINT msg, WPARAM wParam, LPARAM lParam)
{
    switch (msg)
    {
    case WM_NCCALCSIZE:
    {
        return 0;
    }
    case WM_GETMINMAXINFO:
    {
        MINMAXINFO* mminfo = (PMINMAXINFO)lParam;
        RECT workArea;
        SystemParametersInfo(SPI_GETWORKAREA, 0, &workArea, 0);
        mminfo->ptMinTrackSize.x = 1200;
        mminfo->ptMinTrackSize.y = 800;
        mminfo->ptMaxSize.x = workArea.right - workArea.left - 2;
        mminfo->ptMaxSize.y = workArea.bottom - workArea.top - 2;
        mminfo->ptMaxPosition.x = 1;
        mminfo->ptMaxPosition.y = 1;
        return 0;
    }
    case WM_EXITSIZEMOVE: {
        RECT rect;
        GetWindowRect(hWnd, &rect);
        this->x = rect.left;
        this->y = rect.top;
        return 0;
    }
    case WM_SIZE: {
        this->w = LOWORD(lParam);
        this->h = HIWORD(lParam);
        if (ctrl) {
            RECT rect{ .left{0},.top{0},.right{w},.bottom{h} };
            ctrl->SetBoundsAndZoomFactor(rect, 1.0);
        }
        return 0;
    }
    case WM_DESTROY: {
        PostQuitMessage(0);
        return 0;
    }
    }
    return DefWindowProc(hWnd, msg, wParam, lParam);
}

bool Win::createPageController()
{
    auto env = App::getWebViewEnv();
    auto callBackInstance = Callback<ICoreWebView2CreateCoreWebView2ControllerCompletedHandler>(this, &Win::pageCtrlCallBack);
    auto result = env->CreateCoreWebView2Controller(hwnd, callBackInstance.Get());
    if (FAILED(result)) {
        return false;
    }
    return true;
}



BOOL CALLBACK EnumChildProc(HWND hwndChild, LPARAM lParam) {
    wchar_t clsNameBuffer[MAX_PATH] = { 0 };
    int length = GetClassName(hwndChild, clsNameBuffer, MAX_PATH);
    std::wstring clsName(clsNameBuffer);
    // 如果获取成功（返回非零值），则构造std::wstring对象
    if (clsName.ends_with(L"RenderWidgetHostHWND"))
    {
        return TRUE;
    }
    return TRUE;
}


HRESULT Win::pageCtrlCallBack(HRESULT result, ICoreWebView2Controller* controller)
{
    HRESULT hr;
    hr = controller->get_CoreWebView2(&webview);
    wil::com_ptr<ICoreWebView2Settings> settings;
    webview->get_Settings(&settings);
    settings->put_IsScriptEnabled(TRUE);
    settings->put_AreDefaultScriptDialogsEnabled(TRUE);
    settings->put_IsWebMessageEnabled(TRUE);
    wil::com_ptr<ICoreWebView2Settings8> settings8;
    settings->QueryInterface(IID_PPV_ARGS(&settings8));
    settings8->put_IsReputationCheckingRequired(false);

    RECT rect{ .left{0},.top{0},.right{w},.bottom{h} };
    hr = controller->put_Bounds(rect);
    ctrl = controller;

    hostObj = Microsoft::WRL::Make<Host>(this);
    VARIANT remoteObjectAsVariant = {};
    hostObj.query_to<IDispatch>(&remoteObjectAsVariant.pdispVal);
    remoteObjectAsVariant.vt = VT_DISPATCH;
    webview->AddHostObjectToScript(L"host", &remoteObjectAsVariant);
    remoteObjectAsVariant.pdispVal->Release();

    auto navigateCB = Callback<ICoreWebView2NavigationCompletedEventHandler>(this, &Win::navigationCompleted);
    webview->add_NavigationCompleted(navigateCB.Get(), nullptr);

    EventRegistrationToken token;
    auto messageReceivedCB = Callback<ICoreWebView2WebMessageReceivedEventHandler>(this, &Win::messageReceived);
    webview->add_WebMessageReceived(messageReceivedCB.Get(), &token);

    //webview->add_WebMessageReceived(Callback<ICoreWebView2WebMessageReceivedEventHandler>(
    //    [](ICoreWebView2* webview, ICoreWebView2WebMessageReceivedEventArgs* args) -> HRESULT {
    //        wil::unique_cotaskmem_string message;
    //        args->TryGetWebMessageAsString(&message);
    //        // processMessage(&message);
    //        webview->PostWebMessageAsString(message.get());
    //        return S_OK;
    //    }).Get(), &token);

    //std::wstring script = L"console.log(123);window.chrome.webview.postMessage({\"name\":123 });console.log(456);";
    //hr = webview->AddScriptToExecuteOnDocumentCreated(script.c_str(), nullptr);
#ifdef DEBUG
    auto url = L"http://localhost:4321/index.html";
    hr = webview->Navigate(url);
    webview->OpenDevToolsWindow();
#else
    auto webview3 = webview.try_query<ICoreWebView2_3>();
    webview3->SetVirtualHostNameToFolderMapping(L"wv2js", L"D:\\project\\Poster\\Poster\\ui\\prod", COREWEBVIEW2_HOST_RESOURCE_ACCESS_KIND_ALLOW);
    auto url = L"https://wv2js/index.html";
    hr = webview->Navigate(url);
#endif
    return hr;
}

HRESULT Win::navigationCompleted(ICoreWebView2* webview, ICoreWebView2NavigationCompletedEventArgs* args)
{
    return S_OK;
}

HRESULT Win::messageReceived(ICoreWebView2* webview, ICoreWebView2WebMessageReceivedEventArgs* args)
{
    wil::unique_cotaskmem_string messageRaw;
    //args->TryGetWebMessageAsString(&messageRaw);
    args->get_WebMessageAsJson(&messageRaw);
    std::wstring message = messageRaw.get();
    //webview->PostWebMessageAsString(L"allen");
    //webview->PostWebMessageAsJson(L"{\"name\":123 }");
    return S_OK;
}
