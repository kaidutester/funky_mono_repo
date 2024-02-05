import React, { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { styled } from '@kaidu/shared/lib/styles';
import { Centered, HorizontalSpace } from '../../components/atomic/Layouts';
import Text from '../../components/atomic/Text';
import View from '../../components/atomic/View';
import { BLEOTABtn } from '../../components/molecule/BLEOTABtn';
import ControlledInput from '@kaidu/shared/components/molecule/ControlledInput';
import { WiFiOTABtn } from '../../components/molecule/WiFiOTABtn';
import { scale, verticalScale } from '@kaidu/shared/lib/styles';
import { BasicTemplate } from '@kaidu/shared/components/template/BasicTemplate';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import { BaseOverlay } from '../../components/atomic/Overlay';
import { Spinner } from '@kaidu/shared/components/atomic/Spinner';
import Button from '../../components/atomic/Button';
import { writeFirmwareUpdateCommandToOTAWifiChar, writeFirmwareUpdateCommandToVersionChar } from '@kaidu/shared/features/ble-kaidu';
import { useKaiduFirmwareList } from '@kaidu/shared/features/kaidu-server';
import { cancelConnection } from '@kaidu/shared/features/ble-general';
import { AsyncLifecycle, Version } from '@kaidu/shared/types';
import { useNavigation } from '@react-navigation/native';
import { STACK_SCREENS } from '../../navigation/routes';
import { compareVersions } from 'compare-versions';
import { useDispatch } from 'react-redux';
import { updateOperationResult } from '@kaidu/shared/lib/redux/globalStatusSlice';
import { InputSelectorWithModal } from '@kaidu/shared/components/organism/InputSelectorWithModal';
import { FormInput } from '@kaidu/shared/components/atomic/FormInput';


const Section = styled(View)`
    margin-bottom: ${verticalScale(50)}px;
  `;

const SectionTitle = styled(Text)`
    font-size: ${scale(19)}px;
    font-weight: bold;
    margin-bottom: ${verticalScale(20)}px;
  `;

const Margined = styled(HorizontalSpace)`
    margin-bottom: ${verticalScale(10)}px;
  `;


/**
 * 
 */
async function writeFirmwareUpdateCommandViaBLE(bleID: string, version: string, currentVersion: Version) {
  // determine the method to execute based on the firmware

  console.debug('writing firmware update command', bleID, version, currentVersion);
  const { hw, sw } = currentVersion || {};
  if (compareVersions(sw, '0.3.3') > 0) { // > 0.3.3
    await writeFirmwareUpdateCommandToVersionChar(version, bleID);
  } else {
    await writeFirmwareUpdateCommandToOTAWifiChar(version, bleID);
  }
  return await cancelConnection(bleID);
}

/**
 * A screen for preparing Kaidu OTA firmware update
 */
export function KaiduOTAScreen({ route, ...optionals }) {
  // Props
  const { version, deviceId } = route.params;

  const [isUpdating, setUpdating] = useState(false);
  // const [selectedFirmwareVersion, setSelectedFirmwareVersion] = useState('');

  // Hooks
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { control, getValues, trigger, setValue } = useForm({
    defaultValues: {
      firmwareVersion: '',
      firmwareUrl: '',
    }
  });
  const firmwareVersionForm = {
    setValue, name: 'firmwareVersion', trigger
  }

  const watchedFirmwareVersion = useWatch({ control, name: 'firmwareVersion' });
  const { latest, isLoading: isLoadingFirmwareList, firmwareList } = useKaiduFirmwareList();

  // const executeFirmwareUpdate = 

  const [state, execute] = useAsyncFn(async () => {
    const device = { bleID: deviceId };
    const selectedFirmwareVersion = getValues()?.firmwareVersion;
    const targetVersion = selectedFirmwareVersion || latest;
    try {
      console.debug('target version', targetVersion);
      await writeFirmwareUpdateCommandViaBLE(deviceId, targetVersion, version);
      // show a dialog
      dispatch(updateOperationResult({ type: 'write_firmware_update_command', state: AsyncLifecycle.FULFILLED, device }));
    } catch (error) {
      console.error(error);
      dispatch(updateOperationResult({ type: 'write_firmware_update_command', state: AsyncLifecycle.REJECTED, device }))
    }

    // go back to home screen
    navigation.navigate({
      name: STACK_SCREENS.HOME,
    });
  }, [deviceId, latest]);

  const updateData = { version, deviceId };


  return (
    <BasicTemplate>
      <KeyboardAwareScrollView style={{ padding: scale(14) }}>
        <Section>
          {isUpdating ? null : (
            <SectionTitle>Update to the latest</SectionTitle>
          )}
          <Centered>
            <Margined>
              <BLEOTABtn
                {...updateData}
                title={'Update via Bluetooth'}
                isUpdating={isUpdating}
                useCustomizedUrl={false}
              />
            </Margined>
            <HorizontalSpace>
              <WiFiOTABtn
                {...updateData}
                title={'Update via WiFi'}
                isUpdating={isUpdating}
                onUpdating={setUpdating}
              />
            </HorizontalSpace>
          </Centered>
        </Section>
        <Section>
          {isUpdating ? null : (
            <SectionTitle>Update with customized URL</SectionTitle>
          )}
          <HorizontalSpace>
            {isUpdating ? null : (
              <ControlledInput
                name={'firmwareUrl'}
                label={"Firmware URL"}
                autoCapitalize="none"
                control={control}
                autoCorrect={false}
                multiline={false}
              // placeholder="https://example.com/firmware.bin"
              />
            )}
            <BLEOTABtn
              {...updateData}
              title={'Update via Bluetooth'}
              useCustomizedUrl={true}
              isUpdating={isUpdating}
              getValues={getValues}
            />
          </HorizontalSpace>
        </Section>
        <Section>
          {isUpdating ? null : (
            <SectionTitle>Run update on the scanner</SectionTitle>
          )}
          <HorizontalSpace>
            <InputSelectorWithModal
              input={(props, ref) => (
                <FormInput
                  {...props}
                  ref={ref}
                  name={'firmwareVersion'}
                  label='Firmware version'
                  multiline={false}
                  required={true}
                  showBottomLine={true}
                  spellCheck={false}
                  maxLength={32}
                  control={control}
                />
              )}
              selectorTitle={'Select from list'}
              options={firmwareList?.map(item => item.firmware_url)}
              value={watchedFirmwareVersion}
              form={firmwareVersionForm}
              // onChange={setSelectedFirmwareVersion}
            />
            <Button
              title={"Start"}
              onPress={execute}
            />
          </HorizontalSpace>
        </Section>
      </KeyboardAwareScrollView>
      <BaseOverlay isVisible={state.loading || isLoadingFirmwareList}>
        <Spinner />
      </BaseOverlay>
    </BasicTemplate>
  );
}

export default KaiduOTAScreen;
