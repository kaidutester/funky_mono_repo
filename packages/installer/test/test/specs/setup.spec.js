describe('Setup a scanner', function () {
  // let client;
  before(async function () {
    require('expect-webdriverio').setOptions({wait: 5000});
  });

  describe('All', function () {
    describe('scroll and enter setup screen', async function () {
      it('first', async function () {
        await browser.pause(5000);

        const scrollView = await $('~Device Scroll View');
        expect(scrollView).toExist();

        driver.touchPerform([
          {action: 'press', options: {x: 477, y: 1624}},
          {action: 'wait', options: {ms: 100}},
          {action: 'moveTo', options: {x: 477, y: 150}},
          {action: 'release'},
        ]);

        driver.touchPerform([
          {action: 'press', options: {x: 477, y: 1624}},
          {action: 'wait', options: {ms: 100}},
          {action: 'moveTo', options: {x: 477, y: 150}},
          {action: 'release'},
        ]);

        await browser.pause(3000);
        // console.log(await browser.getPageSource());

        // const setupBtn = await $('~Setup this Kaidu Scanner"]');
        const setupBtn = await $('//android.view.ViewGroup[@content-desc="Setup this Kaidu Scanner"]');
        await setupBtn.waitForExist({timeout: 5000});
        expect(setupBtn).toBeDisplayed();
        await setupBtn.click();

        await browser.pause(10000);

        const setupScreen = await $('~Setup Screen');
        await setupScreen.waitForDisplayed({timeout: 20000});
        expect(setupScreen).toBeDisplayed();
      });
    });

    describe('edit data in setup screen', async function () {
      
    })

    // it('Inbox', async function () {

    //   const setupBtn = await $('~Setup this Kaidu Scanner');
    //   // const setupBtn = await scrollView.$(
    //   //   `android.view.ViewGroup[@content-desc=\"Setup this Kaidu Scanner\"]`,
    //   // );

    //   await setupBtn.waitForExist({timeout: 30000});
    //   expect(setupBtn).toExist();
    //   // await setupBtn.scrollIntoView();
    //   await setupBtn.click();

    //   // let el1 = driver.element("//android.view.ViewGroup[@content-desc=\"Setup this Kaidu Scanner\"]");
    //   // el1.click();
    //   browser.pause(10000);

    //   const setupScreen = await $('~Setup Screen');
    //   await setupScreen.waitForDisplayed({timeout: 20000});
    //   expect(setupScreen).toBeDisplayed();

    //   let el2 = driver.element(
    //     '//android.view.ViewGroup[@content-desc="Setup Screen"]/android.view.ViewGroup/android.widget.ScrollView/android.view.ViewGroup/android.widget.ScrollView/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[5]/android.view.ViewGroup',
    //   );
    //   el2.click();
    //   let el3 = driver.element(
    //     '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup[1]/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[2]/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.widget.EditText',
    //   );
    //   el3.click();
    //   el3.clearElement();
    //   el3.setValue('AsherDev44');
    //   let el4 = driver.element(
    //     '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup[1]/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[1]/android.view.ViewGroup[2]/android.view.ViewGroup',
    //   );
    //   el4.click();
    //   let el5 = driver.element(
    //     '//android.view.ViewGroup[@content-desc="Setup Screen"]/android.view.ViewGroup/android.widget.ScrollView/android.view.ViewGroup/android.widget.ScrollView/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[4]/android.view.ViewGroup/android.widget.TextView',
    //   );
    //   el5.click();
    //   let el6 = driver.element(
    //     '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup[1]/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[2]/android.view.ViewGroup/android.view.ViewGroup/android.widget.ScrollView/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup',
    //   );
    //   el6.click();
    //   let el7 = driver.element(
    //     '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup[1]/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[1]/android.view.ViewGroup[2]/android.view.ViewGroup',
    //   );
    //   el7.click();
    //   let el8 = driver.element(
    //     '//android.view.ViewGroup[@content-desc="Setup Screen"]/android.view.ViewGroup/android.widget.ScrollView/android.view.ViewGroup/android.widget.ScrollView/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[5]/android.view.ViewGroup',
    //   );
    //   el8.click();
    //   let el9 = driver.element(
    //     '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup[1]/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[2]/android.view.ViewGroup/android.view.ViewGroup/android.widget.ScrollView/android.view.ViewGroup/android.view.ViewGroup[1]/android.view.ViewGroup',
    //   );
    //   el9.click();
    //   let el10 = driver.element(
    //     '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup[1]/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[1]/android.view.ViewGroup[2]/android.view.ViewGroup',
    //   );
    //   el10.click();
    //   let el11 = driver.element(
    //     '//android.view.ViewGroup[@content-desc="Setup Screen"]/android.view.ViewGroup/android.widget.ScrollView/android.view.ViewGroup/android.widget.ScrollView/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[6]/android.view.ViewGroup',
    //   );
    //   el11.click();
    //   let el12 = driver.element(
    //     '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup[1]/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[2]/android.view.ViewGroup/android.view.ViewGroup/android.widget.ScrollView/android.view.ViewGroup/android.view.ViewGroup[1]/android.view.ViewGroup',
    //   );
    //   el12.click();
    //   el12.click();
    //   let el13 = driver.element(
    //     '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup[1]/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[1]/android.view.ViewGroup[2]/android.view.ViewGroup',
    //   );
    //   el13.click();
    //   let el14 = driver.element(
    //     '//android.view.ViewGroup[@content-desc="Setup Screen"]/android.view.ViewGroup/android.widget.ScrollView/android.view.ViewGroup/android.widget.ScrollView/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[7]/android.view.ViewGroup',
    //   );
    //   el14.click();
    //   let el15 = driver.element(
    //     '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup[1]/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[2]/android.view.ViewGroup/android.view.ViewGroup/android.widget.ScrollView/android.view.ViewGroup/android.view.ViewGroup[1]/android.view.ViewGroup',
    //   );
    //   el15.click();
    //   el15.click();
    //   let el16 = driver.element(
    //     '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup[1]/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[1]/android.view.ViewGroup[2]/android.view.ViewGroup',
    //   );
    //   el16.click();
    //   let el17 = driver.element(
    //     '//android.view.ViewGroup[@content-desc="Setup Screen"]/android.view.ViewGroup/android.widget.ScrollView/android.view.ViewGroup/android.widget.ScrollView/android.view.ViewGroup/android.view.ViewGroup[1]/android.view.ViewGroup[6]/android.view.ViewGroup',
    //   );
    //   el17.click();
    //   let el18 = driver.element(
    //     '(//android.view.View[@content-desc="Preconfig Wi-Fi Setting Tab"])[1]/android.view.ViewGroup',
    //   );
    //   el18.click();
    //   el18.click();
    //   let el19 = driver.element(
    //     '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup[1]/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[1]/android.view.ViewGroup[2]/android.view.ViewGroup',
    //   );
    //   el19.click();
    //   let el20 = driver.element(
    //     '//android.view.ViewGroup[@content-desc="Setup Screen"]/android.view.ViewGroup/android.widget.ScrollView/android.view.ViewGroup/android.widget.ScrollView/android.view.ViewGroup/android.view.ViewGroup[2]/android.view.ViewGroup',
    //   );
    //   el20.click();
    //   let el21 = driver.element(
    //     '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[2]/android.view.ViewGroup/android.view.ViewGroup[1]',
    //   );
    //   el21.click();
    // });
  });
});
