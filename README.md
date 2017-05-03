# WheelFitness
FitBit Game similar to Wheel of Fortune

## Installation and Running

### Running on localhost

#### Install NPM (package manager)

[https://docs.npmjs.com/cli/install](https://docs.npmjs.com/cli/install)


#### Install `ionic` utility with the following command:

```bash
$ npm install -g ionic
```

Go to the UI folder in terminal.


#### To run the project in a browser run:

```bash
$ sudo ionic serve
```

### Compiling From Source

#### Android

##### Java Installation

Go to Oracle's [website](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html) and download and install Java+SDK. Once this is done, open a command prompt and ensure that both `java` and `javac` are available. If not, add these commands to your `PATH`.

##### SDK Installation

Go to the Android Studio [website](https://developer.android.com/studio/index.html) and install Android Studio and the Android SDK for you platform. The installer will walk you through the installation. Once the instalation has completed, go to the install location and add the `tools` and `platform-tools` directories to your `PATH`.

##### Running

To turn your device into a development device, go to `Settings`->`About Phone`->`Software Info` and tap the `Build Number` 7 times. This will enable the developer options settings for your phone.

Once this is done, go into `Developer Options` and enable `USB Debugging`, this will allow your computer to connect to the device.

Connect your device to your computer via USB. Open a command prompt and `cd` into the repository. Run the command `adb devices` - this should display your device connected to the computer. Once you've located your device, simply run `ionic run android` - this will compile the application and deploy it to your device.

### Installing from Provided .apk

Alternatively, you can download a precompiled binary [here](https://drive.google.com/drive/folders/0B91-7NFLpAiydHNBRVBvNTU2cGM?usp=sharing). To install, ensure that you are able to download and install software from unknown sources. Simply download the .apk file and tap on it by going to the download location in your phone's file manager. This will bring up a simple prompt which will allow you to install the app on your phone.

----
More info on this can be found on the Ionic [Getting Started](http://ionicframework.com/getting-started) page and the [Ionic CLI](https://github.com/driftyco/ionic-cli) repo.
