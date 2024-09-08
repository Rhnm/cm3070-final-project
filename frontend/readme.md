# Install node module using (having to use force since there are error while installing)
## will fix these in future improvement for the time being use --force to install
```
npm install --force
```

# Start the project using
```
npx expo start
```

# If any module error
## Install the module with the module name using
```
npm install @modulename/extension --force
```

### Special Note: On starting the frontend using npx expo start you will get an ip address 
### Please copy paste the ip address in the file **apiConfig.js** line no *1*

### Also note that you have to open expo go using the **QR** code on the same network on which you have started the frontend server.