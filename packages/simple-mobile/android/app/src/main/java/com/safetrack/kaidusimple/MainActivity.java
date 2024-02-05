package com.safetrack.kaidusimple;

import android.os.Bundle; // for splashscreen
import org.devio.rn.splashscreen.SplashScreen; // for splashscreen
import com.facebook.react.ReactActivity;

public class MainActivity extends ReactActivity {
  // for splashscreen
   @Override
    protected void onCreate(Bundle savedInstanceState) {
        SplashScreen.show(this);  // here
        super.onCreate(savedInstanceState);
    }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "kaidusimple";
  }
}
