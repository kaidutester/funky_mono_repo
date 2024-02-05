# Kaidu Configuration App

aka Kaidu Installer App

## [Repo](https://bitbucket.org/deeppixel-safetrack/kaidu-mobile-mono/src/master/): in `packages/installer`

## [Wiki](https://bitbucket.org/deeppixel-safetrack/kaidu-mobile-mono/wiki/InstallerApp.md)

### [Development: Setup, Build, and Other issues](https://bitbucket.org/deeppixel-safetrack/kaidu-mobile-mono/wiki/Development.md)

### Cheatsheet for Bundle APK

```shell
cd packages/installer
chmod +x scripts/*.bash # Make all bash scripts executable
yarn install
./scripts/bundleAPK.bash # this script is for release 
```

The APK file will be moved to the home directory `~`

### Running on a Android device

Go to [wiki-Development](https://bitbucket.org/deeppixel-safetrack/kaidu-mobile-mono/wiki/Development.md) and find the `Building / Compiling`/`Android` section

## Documentation

- [Documentation](https://docs.google.com/document/d/1kWwW9j64loqFQmwPz2Hpj5URbS1NUaxKvl5LNnwBQ9g/edit)
- [Bug list & Configuration process](https://docs.google.com/document/d/1TPC_7BKJP4NdC28dU0NnEEdncMpgVaRZaxPtSifnbkU/edit)
- [User Guide for installation](https://docs.google.com/document/d/1mfnUXd4FflhQ6_eWs4KpOvTA55HHKvuvVgo6VGD1KDs/edit?usp=sharing_eil_m&ts=617ffbae)

### Troubleshooting

1. Pressed the 'Scan' button but cannot see the Kaidu Scanner
    1. Check the light, it should be in green
    2. Make sure your device is close to the scanner
    3. Make sure the bluetooth on your device is enabled
    4. If none of above works, try to fully close the app then reopen
    5. If none of above works, use system bluetooth or download [nRF Connect for Mobile](https://www.nordicsemi.com/Products/Development-tools/nrf-connect-for-mobile) to scan. Make sure you can scan the scanner from there.

## Testing

- [Usability Testing Script](https://docs.google.com/document/d/1ywM0MJxKA7F3aXl2q4GktldJQTl5zW5sLq8hT59gdgk/edit?usp=sharing)

## References

- [Kaidu Config Server](https://docs.google.com/document/d/1G9EKOUbv04pafTm7BZxaaBqRTyLVLmhIBrCFY7CQ_-4/edit?usp=sharing)