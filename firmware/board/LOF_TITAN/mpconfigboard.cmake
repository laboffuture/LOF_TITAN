set(IDF_TARGET esp32s3)

set(SDKCONFIG_DEFAULTS
    boards/sdkconfig.base
    boards/sdkconfig.240mhz
    boards/sdkconfig.ble
    boards/sdkconfig.spiram_oct
    boards/LOF_TITAN/sdkconfig.board
)

set(MICROPY_FROZEN_MANIFEST ${CMAKE_CURRENT_LIST_DIR}/manifest.py)
