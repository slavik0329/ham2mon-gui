GUI for ham2mon wav output

![Image description](https://github.com/slavik0329/ham2mon-gui/blob/master/images/ss.png?raw=true)

### Requirements
Node.js
Yarn (optional)

ham2mon - https://github.com/madengr/ham2mon
### Installation

```
git clone https://github.com/slavik0329/ham2mon-gui.git
cd ham2mon-gui
yarn (or npm install)
cd server
yarn (or npm install)
cd ..
```

### Configuring

Copy the config.sample.json to config.json. Modify the wavDir property to the location of where the wav files are being stored.

```
yarn build
```
### Running

```
yarn run prod (or npm run prod)
```
