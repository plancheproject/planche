rm -rf build
cd application
sencha app build
cp -rf  build/production/planche ../build
