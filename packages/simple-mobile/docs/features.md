# Feature list

- Authentication
  - Register new account
    - send a valid register code should success
    - send an invalid register code should fail with error messages
  - Login
    - Google login
    - Login with a unregistered user account will fail
    - Login with a registered user account will success
  - Logout
    - auto logout after a fixed time
    - User can logout mannually
- BLE communication
  - Scanning
    - should start scanning automatically after login
  - Reading
    - configuration-state
    - mac-address
  - Writing configurations to the scanner
- Kaidu config server
  - Fetching exisiting configurations
    - customer
      - Summar`y: get customer list, select & set for a customer
  - Writing configurations to the server

## History

- setup
  - Summary: setup configuration for a plug, which will use other features
  - should
- user
  - Summary: get user data, check if it is register, check if it is super user
- wifi-network
  - Summary: get history wifis, connected wifi, available wifis
    - should store in local storage
