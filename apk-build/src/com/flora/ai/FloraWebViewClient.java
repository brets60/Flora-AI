package com.flora.ai;

import android.content.Intent;
import android.net.Uri;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class FloraWebViewClient extends WebViewClient {
    private final MainActivity activity;

    public FloraWebViewClient(MainActivity activity) {
        this.activity = activity;
    }

    @Override
    public boolean shouldOverrideUrlLoading(WebView view, String url) {
        if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("file:///")) {
            view.loadUrl(url);
            return true;
        }
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            activity.startActivity(intent);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
        super.onReceivedError(view, request, error);
        if (request.isForMainFrame()) {
            view.loadUrl("file:///android_asset/index.html");
        }
    }
}
