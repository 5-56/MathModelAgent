package com.mathmodelagent.mobile;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

import android.content.Intent;
import android.content.Context;
import android.content.pm.PackageManager;
import android.net.Uri;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class TermuxModule extends ReactContextBaseJavaModule {
    private static final String TERMUX_PACKAGE = "com.termux";
    private static final String TERMUX_ACTIVITY = "com.termux.app.TermuxActivity";
    
    public TermuxModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "TermuxModule";
    }

    @ReactMethod
    public void isTermuxInstalled(Promise promise) {
        try {
            PackageManager pm = getReactApplicationContext().getPackageManager();
            boolean isInstalled = pm.getPackageInfo(TERMUX_PACKAGE, 0) != null;
            promise.resolve(isInstalled);
        } catch (PackageManager.NameNotFoundException e) {
            promise.resolve(false);
        } catch (Exception e) {
            promise.reject("ERROR", "Failed to check Termux installation", e);
        }
    }

    @ReactMethod
    public void installTermux(Promise promise) {
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setData(Uri.parse("market://details?id=" + TERMUX_PACKAGE));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getReactApplicationContext().startActivity(intent);
            promise.resolve(true);
        } catch (Exception e) {
            // Fallback to browser
            try {
                Intent intent = new Intent(Intent.ACTION_VIEW);
                intent.setData(Uri.parse("https://play.google.com/store/apps/details?id=" + TERMUX_PACKAGE));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getReactApplicationContext().startActivity(intent);
                promise.resolve(true);
            } catch (Exception ex) {
                promise.reject("ERROR", "Failed to open Termux installation", ex);
            }
        }
    }

    @ReactMethod
    public void executeCommand(String command, Promise promise) {
        try {
            Process process = Runtime.getRuntime().exec(command);
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            StringBuilder output = new StringBuilder();
            String line;
            
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
            
            int exitCode = process.waitFor();
            promise.resolve(output.toString());
        } catch (IOException | InterruptedException e) {
            promise.reject("ERROR", "Command execution failed", e);
        }
    }

    @ReactMethod
    public void getPythonVersion(Promise promise) {
        executeCommand("python3 --version", promise);
    }

    @ReactMethod
    public void getInstalledPackages(Promise promise) {
        try {
            Process process = Runtime.getRuntime().exec("pip list");
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            List<String> packages = new ArrayList<>();
            String line;
            
            while ((line = reader.readLine()) != null) {
                if (line.contains("Package") || line.contains("---")) {
                    continue;
                }
                String[] parts = line.split("\\s+");
                if (parts.length >= 1) {
                    packages.add(parts[0]);
                }
            }
            
            WritableMap result = Arguments.createMap();
            result.putArray("packages", Arguments.fromArray(packages.toArray()));
            promise.resolve(result);
        } catch (IOException e) {
            promise.reject("ERROR", "Failed to get installed packages", e);
        }
    }

    @ReactMethod
    public void installPackage(String packageName, Promise promise) {
        executeCommand("pip install " + packageName, promise);
    }

    @ReactMethod
    public void createWorkDirectory(String path, Promise promise) {
        executeCommand("mkdir -p " + path, promise);
    }

    @ReactMethod
    public void runPythonScript(String scriptPath, Promise promise) {
        executeCommand("python3 " + scriptPath, promise);
    }

    @ReactMethod
    public void startJupyterNotebook(int port, Promise promise) {
        String command = "jupyter notebook --ip=0.0.0.0 --port=" + port + " --no-browser --allow-root";
        executeCommand(command, promise);
    }

    @ReactMethod
    public void stopJupyterNotebook(Promise promise) {
        try {
            Process process = Runtime.getRuntime().exec("pkill -f jupyter");
            int exitCode = process.waitFor();
            promise.resolve(exitCode == 0);
        } catch (IOException | InterruptedException e) {
            promise.reject("ERROR", "Failed to stop Jupyter notebook", e);
        }
    }
}