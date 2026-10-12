package com.flora.ai;

import android.content.Intent;
import android.net.Uri;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.widget.Toast;

public class FloraWebChromeClient extends WebChromeClient {
    private final MainActivity activity;

    public FloraWebChromeClient(MainActivity activity) {
        this.activity = activity;
    }

    @Override
    public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
        if (activity.getUploadMessage() != null) {
            activity.getUploadMessage().onReceiveValue(null);
            activity.setUploadMessage(null);
        }
        activity.setUploadMessage(filePathCallback);

        activity.checkPermissions();

        Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("image/*");
        try {
            activity.startActivityForResult(Intent.createChooser(intent, "Select Plant Photograph"), MainActivity.FILE_CHOOSER_RESULT_CODE);
        } catch (Exception e) {
            activity.setUploadMessage(null);
            Toast.makeText(activity, "Unable to launch photo selector.", Toast.LENGTH_SHORT).show();
            return false;
        }
        return true;
    }
}
