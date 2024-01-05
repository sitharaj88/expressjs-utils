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

const fs = require('fs').promises;
const path = require('path');


/**
 * Custom error class for file operation errors.
 */
class FileUtilsError extends Error {
    /**
     * Creates an instance of FileUtilsError.
     * @param {Error} originalError The original error thrown.
     * @param {string} operation The file operation that caused the error.
     * @param {string} filePath The file path involved in the error.
     */
    constructor(originalError, operation, filePath) {
        const message = FileUtilsError.formatErrorMessage(originalError);
        super(message);
        this.name = "FileUtilsError";
        this.operation = operation;
        this.filePath = filePath;
        this.originalError = originalError;
    }

    /**
     * Formats error messages based on file operation error codes.
     * @param {Error} error The error to format.
     * @returns {string} Formatted error message.
     */
    static formatErrorMessage(error) {
        if (error.code) {
            switch (error.code) {
                case 'ENOENT': return 'File not found';
                case 'EACCES': return 'Permission denied';
                case 'ENOTDIR': return 'Not a directory';
                case 'EISDIR': return 'Is a directory, not a file';
                default: return error.message;
            }
        }
        return error.message;
    }
}


/**
 * Utility class for file operations.
 */
class FileUtils {
    /**
     * Performs the specified file operation.
     * @param {Object} config Configuration object for the file operation.
     * @param {('read'|'write'|'delete'|'deleteFolder'|'download')} config.operation The operation to perform.
     * @param {string} config.filePath Path of the file or directory.
     * @param {Object} [config.options={}] Additional options for the operation.
     * @param {string|Buffer} [config.data=null] Data to write (for write operation).
     * @param {Express.Response} [config.response=null] Express response object (for download operation).
     * @returns {Promise<string|void>} A promise resolving to the operation result.
     */
    static async performOperation({ operation, filePath, options = {}, data = null, response = null }) {
        try {
            const fullPath = path.resolve(filePath);

            if (options.ensureExists && ['read', 'download'].includes(operation)) {
                await FileUtils.ensureFileExists(fullPath);
            }

            if (options.mkdir && ['write'].includes(operation)) {
                const dir = path.dirname(fullPath);
                await fs.mkdir(dir, { recursive: true });
            }

            switch (operation) {
                case 'read':
                    const encoding = options.binary ? null : 'utf8';
                    return await fs.readFile(fullPath, encoding);

                case 'write':
                    await fs.writeFile(fullPath, data, options.binary ? null : 'utf8');
                    return 'File written successfully';

                case 'download':
                    if (!response) {
                        throw new Error('Response object is required for download');
                    }
                    await FileUtils.downloadFile(response, filePath);
                    break;

                case 'delete':
                    await FileUtils.ensureExistsAndDelete(fullPath, false);
                    await fs.unlink(fullPath);
                    return 'File deleted successfully';

                case 'deleteFolder':
                    await FileUtils.ensureExistsAndDelete(fullPath, true);
                    await FileUtils.deleteFolder(fullPath);
                    return 'Folder deleted successfully';

                default:
                    throw new Error('Invalid file operation');
            }
        } catch (error) {
            throw new FileUtilsError(error, operation, filePath);
        }
    }

    static async ensureFileExists(filePath) {
        try {
            await fs.access(filePath, fs.constants.F_OK);
        } catch (error) {
            throw new FileUtilsError(error, 'ensureExists', filePath);
        }
    }

    static async deleteFolder(folderPath) {
        try {
            await fs.rm(folderPath, { recursive: true, force: true });
        } catch (error) {
            throw new FileUtilsError(error, 'deleteFolder', folderPath);
        }
    }

    static downloadFile(response, filePath) {
        return new Promise((resolve, reject) => {
            const fullPath = path.resolve(filePath);
            response.download(fullPath, (error) => {
                if (error) {
                    reject(new FileUtilsError(error, 'download', filePath));
                } else {
                    resolve();
                }
            });
        });
    }

    static async ensureExistsAndDelete(fullPath, isFolder) {
        try {
            await fs.access(fullPath, fs.constants.F_OK);
        } catch (error) {
            throw new FileUtilsError(error, isFolder ? 'deleteFolder' : 'delete', fullPath);
        }

        if (isFolder) {
            await fs.rm(fullPath, { recursive: true, force: true });
        } else {
            await fs.unlink(fullPath);
        }
    }
}

module.exports = { FileUtils, FileUtilsError };
