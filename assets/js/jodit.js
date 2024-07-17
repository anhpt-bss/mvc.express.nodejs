document.addEventListener('DOMContentLoaded', function () {
    const loadLanguageFile = (url) => {
        return fetch(url)
            .then((response) => response.json())
            .catch((error) => {
                console.error('Error loading language file:', error);
                return null;
            });
    };

    const initializeEditors = (languageData) => {
        const editors = document.querySelectorAll('.jodit-editor');
        editors.forEach((editorDiv) => {
            const hiddenInput = document.getElementById(
                editorDiv.id + '-input',
            );
            const config = {
                readonly: false,
                placeholder: 'Nhập nội dung...',
                style: {
                    font: '16px Roboto',
                    color: '#2c2c2c',
                },
                containerStyle: {
                    font: '16px Roboto',
                    color: '#2c2c2c',
                },
                inline: false,
                theme: 'default',
                editorClassName: 'jodit-editor-input',
                className: 'jodit-editor-container',
                language: 'vi',
                i18n: {
                    vi: languageData,
                },
                toolbar: true,
                statusbar: true,
                maxHeight: 'unset',
                toolbarAdaptive: true,
                enableDragAndDropFileToEditor: true,
                uploader: {
                    insertImageAsBase64URI: false,
                    url: '/api/resource/upload',
                    format: 'json',
                    method: 'POST',
                    headers: {
                        accept: 'application/json',
                    },
                    prepareData: function (formData) {
                        return formData;
                    },
                    filesVariableName: function () {
                        return 'files';
                    },
                    isSuccess: (response) => {
                        // Response from server
                        return response;
                    },
                    process: (response) => {
                        // Response from isSuccess
                        if (response?.status_code === 200) {
                            return response.data || [];
                        } else {
                            return response;
                        }
                    },
                    error: (e) => {
                        console.log(e);
                        const j = this.j || this;
                        if (j) {
                            j.message.error(
                                'Đã xảy ra lỗi, vui lòng thử lại sau',
                            );
                        }
                    },
                    defaultHandlerSuccess: function (response) {
                        // Response from process

                        const j = this.j || this;

                        if (response?.success === false) {
                            const j = this.j || this;
                            if (!j) return;
                            j.message.error(
                                'Đã xảy ra lỗi, vui lòng thử lại sau',
                            );
                            return;
                        }

                        if (!j || !response) {
                            return;
                        }

                        const configData =
                            document.getElementById('config-data');
                        const serverUrl = configData
                            ? configData.dataset.serverurl
                            : '';

                        response?.forEach((item) => {
                            const url = `${serverUrl}/${item?.path}`;
                            let element;

                            if (item.mimetype.includes('image')) {
                                element = j.createInside.element('img');
                                element.setAttribute('src', url);
                                element.setAttribute('alt', item.filename);
                                element.setAttribute('title', item.filename);
                                j.s.insertImage(
                                    element,
                                    null,
                                    j.o.imageDefaultWidth,
                                );
                            } else if (item.mimetype.includes('video')) {
                                element = j.createInside.element('video');
                                element.setAttribute('controls', '');
                                element.setAttribute('style', 'width: 100%;');
                                const videoSource =
                                    j.createInside.element('source');
                                videoSource.setAttribute('src', url);
                                videoSource.setAttribute('type', item.mimetype);
                                element.appendChild(videoSource);
                                j.s.insertNode(element);
                            } else if (item.mimetype.includes('audio')) {
                                element = j.createInside.element('audio');
                                element.setAttribute('controls', '');
                                const audioSource =
                                    j.createInside.element('source');
                                audioSource.setAttribute('src', url);
                                audioSource.setAttribute('type', item.mimetype);
                                element.appendChild(audioSource);
                                j.s.insertNode(element);
                            } else {
                                element = j.createInside.element('a');
                                element.setAttribute('href', url);
                                element.setAttribute('target', '_blank');
                                element.setAttribute(
                                    'style',
                                    'display: flex; align-items: center; text-decoration: none; color: rgb(32, 33, 36); background-color: rgb(245, 245, 245); padding: 10px; border: 1px solid rgb(221, 221, 221); font-size: 14px; line-height: 20px; width: fit-content;',
                                );

                                const icon = j.createInside.element('span');
                                icon.className = 'file-icon';
                                icon.textContent = '📄';
                                icon.setAttribute(
                                    'style',
                                    'margin-right: 8px; font-size: 1.2em;',
                                );

                                const fileInfo = j.createInside.element('span');
                                fileInfo.textContent = ` ${item.filename} (${item.size})`;

                                element.appendChild(icon);
                                element.appendChild(fileInfo);

                                j.s.insertNode(element);
                            }

                            const br = j.createInside.element('br');
                            j.s.insertNode(br);
                        });
                    },
                    defaultHandlerError: function (e) {
                        console.log(e);
                        const j = this.j || this;
                        if (j) {
                            j.message.error(
                                'Đã xảy ra lỗi, vui lòng thử lại sau',
                            );
                        }
                    },
                },
            };

            const editor = new Jodit(editorDiv, config);

            editor.value = hiddenInput.value;

            editor.events.on('blur', () => {
                hiddenInput.value = editor.value;
            });
        });
    };

    loadLanguageFile('/assets/libraries/jodit/vi.json').then((languageData) => {
        if (languageData) {
            initializeEditors(languageData);
        }
    });
});