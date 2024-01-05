/*
 * Copyright (c) 2024 Sitharaj Seenivasan
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const express = require('express');
const { FileUtils, FileUtilsError } = require('./src/file.utils');

const app = express();
const port = 3000;

// Route for downloading a file
app.get('/download-file', (req, res) => {
    const filePath = 'path/to/file.zip'; // Adjust the file path

    FileUtils.performOperation({
        operation: 'download',
        filePath: filePath,
        response: res
    })
        .catch(error => {
            if (error instanceof FileUtilsError) {
                // Custom error handling for FileUtilsError
                console.error('FileUtilsError:', error.message);
                res.status(500).send({ error: error.message, operation: error.operation, filePath: error.filePath });
            } else {
                // Generic error handling for other types of errors
                console.error('Error:', error);
                res.status(500).send({ error: 'An unexpected error occurred' });
            }
        });
});

// Route for deleting a folder
app.delete('/delete-folder', (req, res) => {
    const folderPath = 'path/to/folder'; // Adjust the folder path

    FileUtils.performOperation({
        operation: 'deleteFolder',
        filePath: folderPath
    })
        .then(() => res.send({ message: 'Folder deleted successfully' }))
        .catch(error => {
            if (error instanceof FileUtilsError) {
                // Custom error handling for FileUtilsError
                console.error('FileUtilsError:', error.message);
                res.status(500).send({ error: error.message, operation: error.operation, filePath: error.filePath });
            } else {
                // Generic error handling for other types of errors
                console.error('Error:', error);
                res.status(500).send({ error: 'An unexpected error occurred' });
            }
        });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
