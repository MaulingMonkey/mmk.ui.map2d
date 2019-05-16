@setlocal
@pushd "%~dp0.."
::@set PATH=%dp0..\node_modules\.bin;%PATH%
@call tsc -b src examples
@call modularize-namespace global.js --output modular.js --namespace mmk.ui.map2d
@popd
@endlocal
