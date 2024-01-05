
# FileUtils Module

The `FileUtils` module is a utility library for handling file operations in Node.js applications. It provides an easy-to-use interface for common file operations such as reading, writing, deleting files, deleting folders, and streaming files for download in an Express.js application context.

## Features

- **Asynchronous Operations**: All file operations are performed asynchronously, avoiding blocking the event loop.
- **Custom Error Handling**: Includes a custom error class, `FileUtilsError`, for more informative error handling.
- **Versatile File Operations**: Supports reading, writing, deleting files and directories, and streaming file downloads.

## Installation

As this module is not published to NPM, you can include it in your project by copying the `FileUtils.js` file to your project directory.

## Usage

Here are some examples of how to use the `FileUtils` module:

### Reading a File

```javascript
const { FileUtils } = require('./FileUtils');

async function readFile() {
    try {
        const content = await FileUtils.performOperation({
            operation: 'read',
            filePath: 'path/to/your/file.txt'
        });
        console.log(content);
    } catch (error) {
        console.error(error);
    }
}

readFile();
```

### Writing to a File

```javascript
async function writeFile() {
    try {
        await FileUtils.performOperation({
            operation: 'write',
            filePath: 'path/to/your/file.txt',
            data: 'Sample text'
        });
        console.log('File written successfully');
    } catch (error) {
        console.error(error);
    }
}

writeFile();
```

### Deleting a File

```javascript
async function deleteFile() {
    try {
        await FileUtils.performOperation({
            operation: 'delete',
            filePath: 'path/to/your/file.txt'
        });
        console.log('File deleted successfully');
    } catch (error) {
        console.error(error);
    }
}

deleteFile();
```

## License

This project is licensed under the Apache License, Version 2.0 - see the [LICENSE](../../LICENSE) file for details.

## Author

- Sitharaj Seenivasan
