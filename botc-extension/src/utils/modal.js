// botc-extension/src/utils/modal.js

(function() {
    let modalElement, modalTitleElement, modalBodyElement, modalActionsElement, modalCloseButton;
    let isInitialized = false;

    // Function to initialize modal elements once the DOM is ready
    function initializeModalElements() {
        if (isInitialized) return true;

        modalElement = document.getElementById('universalModal');
        modalTitleElement = document.getElementById('modalTitle');
        modalBodyElement = document.getElementById('modalBody');
        modalActionsElement = document.getElementById('modalActions');
        modalCloseButton = document.getElementById('modalCloseButton');

        if (!modalElement || !modalTitleElement || !modalBodyElement || !modalActionsElement || !modalCloseButton) {
            console.error('Modal elements not found in popup.html. Ensure they are correctly defined.');
            // Define dummy functions if elements aren't found to prevent runtime errors elsewhere
            // This helps prevent errors if modal.js is loaded but HTML is missing/incorrect.
            window.ModalManager = {
                showModal: () => console.error("Modal elements not found or not initialized."),
                showAlert: () => console.error("Modal elements not found or not initialized."),
                showPrompt: () => console.error("Modal elements not found or not initialized."),
                showConfirm: () => console.error("Modal elements not found or not initialized."),
                showNotification: () => console.error("Modal elements not found or not initialized."),
                closeModal: () => console.error("Modal elements not found or not initialized.")
            };
            return false;
        }

        modalCloseButton.addEventListener('click', closeModal);
        modalElement.addEventListener('click', (event) => {
            // Close if clicked on the overlay directly
            if (event.target === modalElement) {
                closeModal();
            }
        });
        isInitialized = true;
        return true;
    }

    function closeModal() {
        if (!isInitialized || !modalElement) return;
        modalElement.style.display = 'none';
        // Clear dynamic content to prevent issues on reuse
        if (modalBodyElement) modalBodyElement.innerHTML = '';
        if (modalActionsElement) modalActionsElement.innerHTML = '';
    }

    /**
     * Shows a generic modal.
     * @param {string} title - The title of the modal.
     * @param {string} contentHtml - HTML string for the modal body.
     * @param {Array<Object>} [buttonsConfig=[]] - Array of button configurations.
     *        Each object: { text: string, callback: function, className: string (e.g., 'modal-button-primary'), closesModal: boolean (default true) }
     */
    function showModal(title, contentHtml, buttonsConfig = []) {
        if (!initializeModalElements()) return; // Ensure initialized

        modalTitleElement.textContent = title;
        modalBodyElement.innerHTML = contentHtml;
        modalActionsElement.innerHTML = ''; // Clear previous buttons

        buttonsConfig.forEach(btnConfig => {
            const button = document.createElement('button');
            button.textContent = btnConfig.text;
            button.className = btnConfig.className || 'modal-button-secondary'; // Default class
            button.addEventListener('click', () => {
                if (btnConfig.callback) {
                    btnConfig.callback();
                }
                if (btnConfig.closesModal !== false) { // closesModal defaults to true
                    closeModal();
                }
            });
            modalActionsElement.appendChild(button);
        });

        modalElement.style.display = 'flex';
        // Focus the first focusable element in the modal for accessibility
        const firstFocusable = modalBodyElement.querySelector('input, textarea, select, button') || 
                              (modalActionsElement.children.length > 0 ? modalActionsElement.children[0] : null) ||
                              modalCloseButton;
        if (firstFocusable) {
            firstFocusable.focus();
        }
    }

    /**
     * Shows an alert-style modal.
     * @param {string} title - The title of the alert.
     * @param {string} message - The message to display.
     * @param {function} [okCallback] - Optional callback for the OK button.
     */
    function showAlert(title, message, okCallback) {
        const contentHtml = `<p>${message.replace(/\n/g, '<br>')}</p>`;
        const buttons = [
            {
                text: 'OK',
                className: 'modal-button-primary',
                callback: okCallback
            }
        ];
        showModal(title, contentHtml, buttons);
    }

    /**
     * Shows a prompt-style modal with a single text input.
     * @param {string} title - The title of the prompt.
     * @param {string} label - The label for the input field.
     * @param {string} [defaultValue=''] - The default value for the input.
     * @param {function} submitCallback - Callback function that receives the input value. If it returns false, modal won't close.
     * @param {string} [inputType='text'] - Type of input (e.g., 'text', 'number').
     * @param {string} [placeholder=''] - Placeholder for the input field.
     * @param {object} [inputAttributes={}] - Additional attributes for the input element (e.g., {min: 1, max: 5}).
     */
    function showPrompt(title, label, defaultValue = '', submitCallback, inputType = 'text', placeholder = '', inputAttributes = {}) {
        const inputId = 'modalPromptInput';
        let attributesString = '';
        for (const attr in inputAttributes) {
            attributesString += ` ${attr}="${inputAttributes[attr]}"`;
        }

        const contentHtml = `
            <label for="${inputId}" style="display: block; margin-bottom: 8px;">${label}</label>
            <input type="${inputType}" id="${inputId}" value="${defaultValue}" placeholder="${placeholder || ''}" ${attributesString} style="width: calc(100% - 22px); padding: 10px; border-radius: 4px; border: 1px solid #555; background-color: #333; color: #f0f0f0;">
        `;
        const buttons = [
            {
                text: 'Cancel',
                className: 'modal-button-secondary',
                callback: null // Just closes modal by default
            },
            {
                text: 'Submit',
                className: 'modal-button-primary',
                callback: () => {
                    const inputElement = document.getElementById(inputId);
                    if (inputElement && submitCallback) {
                        // Allow submitCallback to prevent close by returning false
                        if (submitCallback(inputElement.value) === false) {
                            return; // Don't close modal
                        }
                    }
                    closeModal(); // Default: close after submit if callback doesn't return false
                },
                closesModal: false // Handled by the callback logic above
            }
        ];
        showModal(title, contentHtml, buttons);
        // Focus and select text in input field after modal is shown
        const inputElement = document.getElementById(inputId);
        if (inputElement) {
            inputElement.focus();
            inputElement.select();
        }
    }

    /**
     * Shows a confirmation-style modal.
     * @param {string} title - The title of the confirmation.
     * @param {string} message - The confirmation message.
     * @param {function} confirmCallback - Callback if user confirms.
     * @param {function} [cancelCallback] - Optional callback if user cancels.
     */
    function showConfirm(title, message, confirmCallback, cancelCallback) {
        const contentHtml = `<p>${message.replace(/\n/g, '<br>')}</p>`;
        const buttons = [
            {
                text: 'Cancel',
                className: 'modal-button-secondary',
                callback: cancelCallback
            },
            {
                text: 'Confirm',
                className: 'modal-button-primary',
                callback: confirmCallback
            }
        ];
        showModal(title, contentHtml, buttons);
    }

    /**
     * Shows a notification-style modal that auto-closes.
     * @param {string} title - The title of the notification.
     * @param {string} message - The message to display.
     * @param {number} duration - Time in milliseconds before the modal automatically closes.
     */
    function showNotification(title, message, duration) {
        if (!initializeModalElements()) return;

        modalTitleElement.textContent = title;
        modalBodyElement.innerHTML = `<p>${message.replace(/\n/g, '<br>')}</p>`;
        modalActionsElement.innerHTML = ''; // Ensure no buttons from previous modals

        modalElement.style.display = 'flex';
        // Optionally, focus the close button or the modal itself if no other focusable elements
        modalCloseButton.focus(); 

        if (duration && duration > 0) {
            // console.log(`[ModalManager] Setting timeout to close notification in ${duration}ms`);
            setTimeout(() => {
                // console.log('[ModalManager] Timeout fired, attempting to close notification modal.');
                // Check if the current modal is still the notification one before closing
                // This is a bit tricky without more state, but for now, we'll assume it is.
                // A more robust solution might involve an ID for the notification.
                if (modalElement.style.display === 'flex' && modalActionsElement.innerHTML === '') { // Basic check
                    closeModal();
                }
            }, duration);
        }
    }

    // Expose ModalManager to global scope
    window.ModalManager = {
        showModal,
        showAlert,
        showPrompt,
        showConfirm,
        showNotification,
        closeModal
    };

    // Initialize elements when the DOM is fully loaded
    if (document.readyState === 'loading') { // Loading hasn't finished yet
        document.addEventListener('DOMContentLoaded', initializeModalElements);
    } else { // `DOMContentLoaded` has already fired
        initializeModalElements();
    }
})();
