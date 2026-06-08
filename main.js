const { Plugin, PluginSettingTab, Setting, MarkdownView, Notice } = require('obsidian');

// 语言包定义
const LOCALES = {
    'zh-cn': {
        // 插件名称
        pluginName: '摩尔斯码翻译器',
        // 窗口标题
        windowTitle: '摩尔斯码翻译器',
        // 设置页面
        settingsTitle: '摩尔斯码翻译器设置',
        autoOpen: '自动打开',
        autoOpenDesc: '启动 Obsidian 时自动打开翻译器窗口',
        defaultAutoInsert: '全局默认自动输入',
        defaultAutoInsertDesc: '新打开窗口时的默认自动输入状态（窗口中可单独调整）',
        autoInsertDelay: '自动输入等待时间',
        autoInsertDelayDesc: '停止输入后等待多少毫秒自动插入（单位：毫秒）',
        dotChars: '点字符集合',
        dotCharsDesc: '用于表示摩尔斯码中的点（·）的字符（多个字符用逗号分隔）',
        dashChars: '横字符集合',
        dashCharsDesc: '用于表示摩尔斯码中的横（-）的字符（多个字符用逗号分隔）',
        deleteKeys: '删除按键',
        deleteKeysDesc: '按下这些按键时删除光标前的字符（有输入内容时删除输入框，否则删除文档中的字符）多个按键用逗号分隔',
        newlineKeys: '换行按键',
        newlineKeysDesc: '按下这些按键时在文档中插入换行（有输入内容时无效）多个按键用逗号分隔',
        language: '界面语言',
        languageDesc: '选择插件界面的显示语言',
        languageZh: '中文',
        languageEn: 'English',
        windowState: '翻译器窗口',
        windowStateDesc: '控制摩尔斯码翻译器窗口的打开/关闭状态',
        openWindow: '打开窗口',
        closeWindow: '关闭窗口',
        windowOpened: '窗口已打开',
        windowClosed: '窗口已关闭',
        // 使用说明
        usageTitle: '使用说明',
        usageText: '• 使用命令 "切换摩尔斯码翻译器" 打开/关闭窗口\n• 输入摩尔斯码，空格分隔字母，斜杠(/)分隔单词\n• 按 Enter 插入翻译结果到光标位置（始终可用）\n• 点击"设置选项"展开/折叠更多设置\n• 按 Esc 关闭窗口\n• 窗口位置可拖动',
        warningText: '⚠️ 注意：请确保文档处于编辑模式（实时预览或源码模式），阅读模式下无法使用翻译器',
        // 窗口内文本
        inputPlaceholder: '输入摩尔斯码（使用 {dot}/{dash} 等）...',
        settingsOption: '设置选项',
        autoInsertLabel: '🔁 自动输入（停止后自动插入）',
        upperCaseLabel: '🔠 大写输出',
        advancedSettings: '⚙️ 高级设置',
        decodePreview: '译码',
        invalidChars: '⚠️ 无效字符',
        cannotRecognize: '无法识别',
        // 通知消息
        noticeSwitchToEdit: '请切换到编辑模式（实时预览或源码模式）后使用摩尔斯码翻译器',
        noticeCannotEdit: '当前文档无法编辑，请切换到编辑模式',
    },
    'en': {
        pluginName: 'Morse Translator',
        windowTitle: 'Morse Translator',
        settingsTitle: 'Morse Translator Settings',
        autoOpen: 'Auto Open',
        autoOpenDesc: 'Automatically open translator window when Obsidian starts',
        defaultAutoInsert: 'Default Auto Insert',
        defaultAutoInsertDesc: 'Default auto-insert state for new windows (can be changed per window)',
        autoInsertDelay: 'Auto Insert Delay',
        autoInsertDelayDesc: 'Milliseconds to wait after typing stops before auto-inserting',
        dotChars: 'Dot Characters',
        dotCharsDesc: 'Characters representing dots (·) in Morse code (separate multiple with commas)',
        dashChars: 'Dash Characters',
        dashCharsDesc: 'Characters representing dashes (-) in Morse code (separate multiple with commas)',
        deleteKeys: 'Delete Keys',
        deleteKeysDesc: 'Press these keys to delete character before cursor (delete in input box if has content, otherwise delete in document). Separate multiple with commas',
        newlineKeys: 'Newline Keys',
        newlineKeysDesc: 'Press these keys to insert newline in document (ignored when input box has content). Separate multiple with commas',
        language: 'Interface Language',
        languageDesc: 'Select the display language for the plugin interface',
        languageZh: '中文',
        languageEn: 'English',
        windowState: 'Translator Window',
        windowStateDesc: 'Control the open/close state of the Morse translator window',
        openWindow: 'Open Window',
        closeWindow: 'Close Window',
        windowOpened: 'Window opened',
        windowClosed: 'Window closed',
        usageTitle: 'Usage Instructions',
        usageText: '• Use command "Toggle Morse Translator" to open/close window\n• Enter Morse code, spaces separate letters, slashes(/) separate words\n• Press Enter to insert translation at cursor (always available)\n• Click "Settings" to expand/collapse more options\n• Press Esc to close window\n• Window is draggable',
        warningText: '⚠️ Note: Make sure the document is in edit mode (Live Preview or Source mode). Translator cannot be used in reading mode',
        inputPlaceholder: 'Enter Morse code (use {dot}/{dash} etc.)...',
        settingsOption: 'Settings',
        autoInsertLabel: '🔁 Auto Insert (insert after typing stops)',
        upperCaseLabel: '🔠 Uppercase Output',
        advancedSettings: '⚙️ Advanced Settings',
        decodePreview: 'Decode',
        invalidChars: '⚠️ Invalid characters',
        cannotRecognize: 'Cannot recognize',
        noticeSwitchToEdit: 'Please switch to edit mode (Live Preview or Source mode) to use Morse translator',
        noticeCannotEdit: 'Current document cannot be edited, please switch to edit mode',
    }
};

// 摩尔斯码映射表
const MORSE_MAP = {
    '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E',
    '..-.': 'F', '--.': 'G', '....': 'H', '..': 'I', '.---': 'J',
    '-.-': 'K', '.-..': 'L', '--': 'M', '-.': 'N', '---': 'O',
    '.--.': 'P', '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T',
    '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X', '-.--': 'Y',
    '--..': 'Z',
    '-----': '0', '.----': '1', '..---': '2', '...--': '3', '....-': '4',
    '.....': '5', '-....': '6', '--...': '7', '---..': '8', '----.': '9',
    '.-.-.-': '.', '--..--': ',', '..--..': '?', '.----.': "'", '-.-.--': '!',
    '-..-.': '/', '-.--.': '(', '-.--.-': ')', '.-...': '&', '---...': ':',
    '-.-.-.': ';', '-...-': '=', '.-.-.': '+', '-....-': '-', '..--.-': '_',
    '.-..-.': '"', '...-..-': '$', '.--.-.': '@'
};

class MorseTranslatorPlugin extends Plugin {
    async onload() {
        console.log('🔵 [Morse Translator] 插件加载中...');
        
        await this.loadSettings();
        
        // 窗口内开关状态（不持久化，每次打开窗口独立）
        this.windowAutoInsert = this.settings.autoInsert; // 默认使用全局设置
        this.windowUpperCase = true; // 默认大写
        
        this.addCommand({
            id: 'toggle-morse-translator',
            name: '切换摩尔斯码翻译器',
            callback: () => this.toggleTranslator()
        });
        
        this.addCommand({
            id: 'open-morse-translator',
            name: '打开摩尔斯码翻译器',
            callback: () => this.openTranslator()
        });
        
        this.addCommand({
            id: 'close-morse-translator',
            name: '关闭摩尔斯码翻译器',
            callback: () => this.closeTranslator()
        });
        
        this.addSettingTab(new MorseSettingTab(this.app, this));
        
        if (this.settings.autoOpen) {
            console.log('🟢 [Morse Translator] 自动打开模式已启用');
            this.openTranslator();
        }
        
        console.log('✅ [Morse Translator] 插件加载完成');
    }
    
    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }
    
    async saveSettings() {
        await this.saveData(this.settings);
    }
    
    // 获取当前语言的文本
    t(key) {
        const locale = this.settings.language || 'zh-cn';
        return LOCALES[locale]?.[key] || LOCALES['zh-cn'][key] || key;
    }
    
    // 触发窗口状态变化事件
    emitWindowStateChange() {
        // 使用事件总线通知状态变化
        this.app.workspace.trigger('morse-translator-state-change', this.isOpen);
    }
    
    // 标准化摩尔斯码输入（支持多个字符映射）
    normalizeMorseInput(input) {
        let result = '';
        for (const ch of input) {
            if (this.settings.dotChars.includes(ch)) {
                result += '.';
            } else if (this.settings.dashChars.includes(ch)) {
                result += '-';
            } else if (ch === ' ' || ch === '\t') {
                result += ' ';
            } else if (ch === '/') {
                result += '/';
            } else {
                result += ch; // 无效字符保留用于错误提示
            }
        }
        return result;
    }
    
    // 检查输入是否包含无效字符
    hasInvalidChars(input) {
        for (const ch of input) {
            const isValid = this.settings.dotChars.includes(ch) ||
                           this.settings.dashChars.includes(ch) ||
                           ch === ' ' || ch === '\t' || ch === '/';
            if (!isValid) return true;
        }
        return false;
    }
    
    getActiveEditor() {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        
        if (!activeView) {
            return null;
        }
        
        if (activeView.getMode) {
            const mode = activeView.getMode();
            if (mode === 'preview') {
                new Notice(this.t('noticeSwitchToEdit'), 3000);
                return null;
            }
        }
        
        if (!activeView.editor) {
            new Notice(this.t('noticeCannotEdit'), 3000);
            return null;
        }
        
        return activeView.editor;
    }
    
    toggleTranslator() {
        if (this.isOpen) {
            this.closeTranslator();
        } else {
            this.openTranslator();
        }
    }
    
    openTranslator() {
        console.log('🟢 [Morse Translator] 打开翻译器');
        
        if (this.isOpen) {
            console.log('⚠️ [Morse Translator] 翻译器已打开，跳过');
            return;
        }
        
        const editor = this.getActiveEditor();
        if (!editor) {
            console.log('❌ [Morse Translator] 没有找到可用的编辑器');
            return;
        }
        
        this.isOpen = true;
        this.createFloatingWindow(editor);
        this.emitWindowStateChange(); // 触发状态变化事件
    }
    
    closeTranslator() {
        console.log('🔴 [Morse Translator] 关闭翻译器');
        
        // 清除自动输入的定时器
        if (this.autoInsertTimeout) {
            clearTimeout(this.autoInsertTimeout);
            this.autoInsertTimeout = null;
        }
        
        this.isOpen = false;
        this.closeFloatWindow();
        this.emitWindowStateChange(); // 触发状态变化事件
    }
    
    // 执行插入操作
    performAutoInsert(morse, normalizedMorse) {
        let translation = this.translateMorse(normalizedMorse);
        if (translation) {
            // 应用大小写转换
            translation = this.applyCaseConversion(translation);
            
            const currentEditor = this.getActiveEditor();
            if (currentEditor) {
                const cursor = currentEditor.getCursor();
                currentEditor.replaceRange(translation, cursor);
                const newPos = {
                    line: cursor.line,
                    ch: cursor.ch + translation.length
                };
                currentEditor.setCursor(newPos);
                this.floatEditor = currentEditor;
                console.log('✅ [Morse Translator] 自动插入:', translation);
                
                // 清除输入框内容
                if (this.floatInput) {
                    this.floatInput.value = '';
                }
                if (this.floatHint) {
                    this.floatHint.textContent = '';
                    this.floatHint.className = 'morse-translator-hint';
                }
            }
        }
    }
    
    // 执行删除操作（有输入内容时删除输入框，否则删除文档中的字符）
    performDelete() {
        if (this.floatInput && this.floatInput.value.length > 0) {
            // 输入框有内容：删除输入框中的最后一个字符
            const currentValue = this.floatInput.value;
            this.floatInput.value = currentValue.slice(0, -1);
            // 触发 input 事件以更新译码预览
            const inputEvent = new Event('input');
            this.floatInput.dispatchEvent(inputEvent);
            console.log('⌫ [Morse Translator] 删除输入框字符');
        } else {
            // 输入框为空：删除文档中光标前的字符
            const currentEditor = this.getActiveEditor();
            if (currentEditor) {
                const cursor = currentEditor.getCursor();
                if (cursor.ch > 0) {
                    // 删除光标前一个字符
                    const from = { line: cursor.line, ch: cursor.ch - 1 };
                    const to = cursor;
                    currentEditor.replaceRange('', from, to);
                    currentEditor.setCursor({ line: cursor.line, ch: cursor.ch - 1 });
                    console.log('⌫ [Morse Translator] 删除文档字符');
                } else if (cursor.line > 0) {
                    // 光标在行首，删除换行符（将当前行合并到上一行）
                    const prevLineLength = currentEditor.getLine(cursor.line - 1).length;
                    const from = { line: cursor.line - 1, ch: prevLineLength };
                    const to = cursor;
                    currentEditor.replaceRange('', from, to);
                    currentEditor.setCursor({ line: cursor.line - 1, ch: prevLineLength });
                    console.log('⌫ [Morse Translator] 删除换行符');
                }
            }
        }
    }
    
    // 执行换行操作（在文档中插入换行）
    performNewline() {
        // 只有当输入框为空时才执行换行
        if (this.floatInput && this.floatInput.value.length > 0) {
            console.log('⏎ [Morse Translator] 输入框有内容，忽略换行');
            return;
        }
        
        const currentEditor = this.getActiveEditor();
        if (currentEditor) {
            const cursor = currentEditor.getCursor();
            currentEditor.replaceRange('\n', cursor);
            currentEditor.setCursor({ line: cursor.line + 1, ch: 0 });
            console.log('⏎ [Morse Translator] 插入换行');
        }
    }
    
    // 应用大小写转换
    applyCaseConversion(text) {
        if (this.windowUpperCase) {
            return text.toUpperCase();
        } else {
            return text.toLowerCase();
        }
    }
    
    // 打开设置页面
    openSettings() {
        // @ts-ignore
        this.app.setting.open();
        // @ts-ignore
        this.app.setting.openTabById('morse-translator');
    }
    
    // 刷新窗口所有文本（语言切换时调用）
    refreshWindowText() {
        if (!this.isOpen || !this.floatWindow) return;
        
        // 更新窗口标题
        const titleEl = this.floatWindow.querySelector('.morse-translator-title');
        if (titleEl) titleEl.textContent = this.t('windowTitle');
        
        // 更新输入框占位符
        if (this.floatInput) {
            const placeholder = this.t('inputPlaceholder')
                .replace('{dot}', this.settings.dotChars[0] || '.')
                .replace('{dash}', this.settings.dashChars[0] || '-');
            this.floatInput.placeholder = placeholder;
        }
        
        // 更新折叠按钮文本
        const toggleBtn = this.floatWindow.querySelector('.morse-translator-toggle');
        if (toggleBtn) {
            const isExpanded = toggleBtn.innerHTML.includes('▲');
            toggleBtn.innerHTML = isExpanded ? `⚙️ ${this.t('settingsOption')} ▲` : `⚙️ ${this.t('settingsOption')} ▼`;
        }
        
        // 更新控制面板内的文本
        const controlsContent = this.floatWindow.querySelector('.morse-translator-controls-content');
        if (controlsContent) {
            const labels = controlsContent.querySelectorAll('.morse-translator-checkbox');
            if (labels.length >= 2) {
                // 自动输入标签
                const autoInsertText = labels[0].childNodes[1];
                if (autoInsertText) autoInsertText.textContent = this.t('autoInsertLabel');
                // 大小写标签
                const caseText = labels[1].childNodes[1];
                if (caseText) caseText.textContent = this.t('upperCaseLabel');
            }
            
            // 高级设置按钮
            const settingsBtn = controlsContent.querySelector('.morse-translator-settings-btn');
            if (settingsBtn) settingsBtn.innerHTML = this.t('advancedSettings');
        }
        
        // 更新预览提示（如果有内容）
        if (this.floatHint && this.floatHint.textContent) {
            const currentText = this.floatHint.textContent;
            if (currentText.startsWith('译码:') || currentText.startsWith('Decode:')) {
                const translation = currentText.replace(/^(译码:|Decode:)\s*/, '');
                this.floatHint.textContent = `${this.t('decodePreview')}: ${translation}`;
            } else if (currentText === '⚠️ 无效字符' || currentText === '⚠️ Invalid characters') {
                this.floatHint.textContent = this.t('invalidChars');
            } else if (currentText === '无法识别' || currentText === 'Cannot recognize') {
                this.floatHint.textContent = this.t('cannotRecognize');
            }
        }
    }
    
    // 创建底部栏（设置选项折叠按钮 + 译码预览在同一行）
    createBottomBar() {
        const bottomBar = document.createElement('div');
        bottomBar.className = 'morse-translator-bottom-bar';
        bottomBar.style.display = 'flex';
        bottomBar.style.justifyContent = 'space-between';
        bottomBar.style.alignItems = 'center';
        bottomBar.style.marginTop = '8px';
        bottomBar.style.padding = '4px 0';
        bottomBar.style.borderTop = '1px solid var(--background-modifier-border)';
        
        // 左侧：折叠按钮
        const toggleBtn = document.createElement('div');
        toggleBtn.className = 'morse-translator-toggle';
        toggleBtn.innerHTML = `⚙️ ${this.t('settingsOption')} ▼`;
        toggleBtn.style.cursor = 'pointer';
        toggleBtn.style.fontSize = '11px';
        toggleBtn.style.color = 'var(--text-muted)';
        toggleBtn.style.display = 'flex';
        toggleBtn.style.alignItems = 'center';
        toggleBtn.style.gap = '4px';
        toggleBtn.style.padding = '2px 6px';
        toggleBtn.style.borderRadius = '4px';
        
        // 右侧：译码预览区域
        const hintPreview = document.createElement('div');
        hintPreview.className = 'morse-translator-hint-preview';
        hintPreview.style.flex = '1';
        hintPreview.style.textAlign = 'right';
        hintPreview.style.fontSize = '11px';
        hintPreview.style.color = 'var(--text-muted)';
        hintPreview.style.fontFamily = 'monospace';
        hintPreview.style.overflow = 'hidden';
        hintPreview.style.textOverflow = 'ellipsis';
        hintPreview.style.whiteSpace = 'nowrap';
        
        bottomBar.appendChild(toggleBtn);
        bottomBar.appendChild(hintPreview);
        
        return { bottomBar, toggleBtn, hintPreview };
    }
    
    // 创建可折叠的控制面板（包含设置选项和高级设置按钮）
    createCollapsiblePanel() {
        const panelContainer = document.createElement('div');
        panelContainer.className = 'morse-translator-collapsible';
        panelContainer.style.display = 'none'; // 初始折叠
        panelContainer.style.marginTop = '8px';
        panelContainer.style.padding = '8px';
        panelContainer.style.backgroundColor = 'var(--background-secondary)';
        panelContainer.style.borderRadius = '4px';
        panelContainer.style.border = '1px solid var(--background-modifier-border)';
        
        // 控制内容区域
        const controlsContent = document.createElement('div');
        controlsContent.className = 'morse-translator-controls-content';
        controlsContent.style.display = 'flex';
        controlsContent.style.flexDirection = 'column';
        controlsContent.style.gap = '12px';
        
        // 自动输入开关
        const autoInsertLabel = document.createElement('label');
        autoInsertLabel.className = 'morse-translator-checkbox';
        autoInsertLabel.style.display = 'flex';
        autoInsertLabel.style.alignItems = 'center';
        autoInsertLabel.style.gap = '8px';
        autoInsertLabel.style.fontSize = '12px';
        autoInsertLabel.style.cursor = 'pointer';
        
        const autoInsertCheckbox = document.createElement('input');
        autoInsertCheckbox.type = 'checkbox';
        autoInsertCheckbox.checked = this.windowAutoInsert;
        autoInsertCheckbox.addEventListener('change', (e) => {
            this.windowAutoInsert = e.target.checked;
            // 如果关闭自动输入，清除待执行的定时器
            if (!this.windowAutoInsert && this.autoInsertTimeout) {
                clearTimeout(this.autoInsertTimeout);
                this.autoInsertTimeout = null;
            }
        });
        
        const autoInsertText = document.createTextNode(this.t('autoInsertLabel'));
        autoInsertLabel.appendChild(autoInsertCheckbox);
        autoInsertLabel.appendChild(autoInsertText);
        
        // 大小写转换开关
        const caseLabel = document.createElement('label');
        caseLabel.className = 'morse-translator-checkbox';
        caseLabel.style.display = 'flex';
        caseLabel.style.alignItems = 'center';
        caseLabel.style.gap = '8px';
        caseLabel.style.fontSize = '12px';
        caseLabel.style.cursor = 'pointer';
        
        const caseCheckbox = document.createElement('input');
        caseCheckbox.type = 'checkbox';
        caseCheckbox.checked = this.windowUpperCase;
        caseCheckbox.addEventListener('change', (e) => {
            this.windowUpperCase = e.target.checked;
            // 重新计算当前输入的翻译提示
            if (this.floatInput && this.floatInput.value.trim()) {
                const inputEvent = new Event('input');
                this.floatInput.dispatchEvent(inputEvent);
            }
        });
        
        const caseText = document.createTextNode(this.t('upperCaseLabel'));
        caseLabel.appendChild(caseCheckbox);
        caseLabel.appendChild(caseText);
        
        // 高级设置按钮
        const settingsBtn = document.createElement('button');
        settingsBtn.className = 'morse-translator-settings-btn';
        settingsBtn.innerHTML = this.t('advancedSettings');
        settingsBtn.style.cursor = 'pointer';
        settingsBtn.style.fontSize = '11px';
        settingsBtn.style.padding = '4px 8px';
        settingsBtn.style.backgroundColor = 'var(--background-primary)';
        settingsBtn.style.border = '1px solid var(--background-modifier-border)';
        settingsBtn.style.borderRadius = '4px';
        settingsBtn.style.color = 'var(--text-muted)';
        settingsBtn.style.width = '100%';
        settingsBtn.style.marginTop = '4px';
        settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openSettings();
        });
        
        controlsContent.appendChild(autoInsertLabel);
        controlsContent.appendChild(caseLabel);
        controlsContent.appendChild(settingsBtn);
        
        panelContainer.appendChild(controlsContent);
        
        return { panelContainer, autoInsertCheckbox, caseCheckbox };
    }
    
    createFloatingWindow(editor) {
        console.log('🪟 [Morse Translator] 创建悬浮窗口（固定位置，可拖动）');
        
        if (this.floatWindow) {
            this.floatWindow.remove();
        }
        
        // 清除旧的定时器
        if (this.autoInsertTimeout) {
            clearTimeout(this.autoInsertTimeout);
            this.autoInsertTimeout = null;
        }
        
        const container = document.createElement('div');
        container.className = 'morse-translator-float';
        
        // 使窗口可拖动
        let isDragging = false;
        let dragOffsetX = 0;
        let dragOffsetY = 0;
        
        const titleBar = document.createElement('div');
        titleBar.className = 'morse-translator-titlebar';
        titleBar.style.cursor = 'move';
        
        const title = document.createElement('span');
        title.textContent = this.t('windowTitle');
        title.className = 'morse-translator-title';
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.className = 'morse-translator-close';
        closeBtn.addEventListener('click', () => this.closeTranslator());
        
        titleBar.appendChild(title);
        titleBar.appendChild(closeBtn);
        
        const input = document.createElement('input');
        input.type = 'text';
        const placeholder = this.t('inputPlaceholder')
            .replace('{dot}', this.settings.dotChars[0] || '.')
            .replace('{dash}', this.settings.dashChars[0] || '-');
        input.placeholder = placeholder;
        input.className = 'morse-translator-input';
        
        // 创建底部栏（折叠按钮 + 译码预览）
        const { bottomBar, toggleBtn, hintPreview } = this.createBottomBar();
        
        // 创建可折叠面板
        const { panelContainer, autoInsertCheckbox, caseCheckbox } = this.createCollapsiblePanel();
        
        container.appendChild(titleBar);
        container.appendChild(input);
        container.appendChild(bottomBar);
        container.appendChild(panelContainer);
        
        document.body.appendChild(container);
        
        // 设置固定位置 (屏幕中央偏上)
        this.positionWindowStatic(container);
        
        this.floatWindow = container;
        this.floatInput = input;
        this.floatHint = hintPreview; // 使用 hintPreview 作为译码显示区域
        this.floatEditor = editor;
        
        // 保存开关引用
        this.floatAutoInsertCheckbox = autoInsertCheckbox;
        this.floatCaseCheckbox = caseCheckbox;
        
        // 保存控制面板引用用于语言切换
        this.floatPanelContainer = panelContainer;
        this.floatToggleBtn = toggleBtn;
        
        // 折叠/展开逻辑
        let isExpanded = false;
        toggleBtn.addEventListener('click', () => {
            isExpanded = !isExpanded;
            if (isExpanded) {
                panelContainer.style.display = 'block';
                toggleBtn.innerHTML = `⚙️ ${this.t('settingsOption')} ▲`;
            } else {
                panelContainer.style.display = 'none';
                toggleBtn.innerHTML = `⚙️ ${this.t('settingsOption')} ▼`;
            }
        });
        
        // 拖动逻辑
        const onMouseMove = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            let newLeft = e.clientX - dragOffsetX;
            let newTop = e.clientY - dragOffsetY;
            
            const maxX = window.innerWidth - container.offsetWidth;
            const maxY = window.innerHeight - container.offsetHeight;
            newLeft = Math.max(0, Math.min(newLeft, maxX));
            newTop = Math.max(0, Math.min(newTop, maxY));
            
            container.style.left = `${newLeft}px`;
            container.style.top = `${newTop}px`;
        };
        
        const onMouseUp = () => {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        
        titleBar.addEventListener('mousedown', (e) => {
            if (e.target === closeBtn) return;
            isDragging = true;
            dragOffsetX = e.clientX - container.offsetLeft;
            dragOffsetY = e.clientY - container.offsetTop;
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            e.preventDefault();
        });
        
        // 输入框事件处理
        const handleInput = () => {
            // 清除之前的自动插入定时器
            if (this.autoInsertTimeout) {
                clearTimeout(this.autoInsertTimeout);
                this.autoInsertTimeout = null;
            }
            
            const morse = input.value.trim();
            if (morse === '') {
                hintPreview.textContent = '';
                hintPreview.style.color = 'var(--text-muted)';
                return;
            }
            
            // 检查无效字符
            if (this.hasInvalidChars(morse)) {
                hintPreview.textContent = this.t('invalidChars');
                hintPreview.style.color = 'var(--text-error)';
                return;
            }
            
            const normalizedMorse = this.normalizeMorseInput(morse);
            let translation = this.translateMorse(normalizedMorse);
            
            if (translation) {
                // 应用大小写转换
                let displayTranslation = this.applyCaseConversion(translation);
                hintPreview.textContent = `${this.t('decodePreview')}: ${displayTranslation}`;
                hintPreview.style.color = 'var(--text-accent)';
                
                // 自动输入逻辑：如果窗口内自动输入开关打开，设置定时器
                if (this.windowAutoInsert && translation) {
                    this.autoInsertTimeout = setTimeout(() => {
                        this.performAutoInsert(morse, normalizedMorse);
                        // 插入后清除输入框和提示
                        if (this.floatInput) {
                            this.floatInput.value = '';
                        }
                        if (this.floatHint) {
                            this.floatHint.textContent = '';
                            this.floatHint.style.color = 'var(--text-muted)';
                        }
                        this.autoInsertTimeout = null;
                    }, this.settings.autoInsertDelay);
                }
            } else {
                hintPreview.textContent = this.t('cannotRecognize');
                hintPreview.style.color = 'var(--text-error)';
            }
        };
        
        const handleKeydown = (e) => {
            // 检查是否是删除按键
            const deleteKeys = this.settings.deleteKeys || ['Backspace', 'Delete'];
            if (deleteKeys.includes(e.key)) {
                e.preventDefault();
                this.performDelete();
                return;
            }
            
            // 检查是否是换行按键
            const newlineKeys = this.settings.newlineKeys || ['Enter'];
            if (newlineKeys.includes(e.key) && e.key !== 'Enter') {
                // 非 Enter 的换行按键
                e.preventDefault();
                this.performNewline();
                return;
            }
            
            if (e.key === 'Enter') {
                // 清除自动插入定时器
                if (this.autoInsertTimeout) {
                    clearTimeout(this.autoInsertTimeout);
                    this.autoInsertTimeout = null;
                }
                
                e.preventDefault();
                const morse = input.value.trim();
                if (morse) {
                    // 检查无效字符
                    if (this.hasInvalidChars(morse)) {
                        input.value = '';
                        hintPreview.textContent = '';
                        return;
                    }
                    
                    const normalizedMorse = this.normalizeMorseInput(morse);
                    let translation = this.translateMorse(normalizedMorse);
                    if (translation) {
                        // 应用大小写转换
                        translation = this.applyCaseConversion(translation);
                        
                        const currentEditor = this.getActiveEditor();
                        if (currentEditor) {
                            const cursor = currentEditor.getCursor();
                            currentEditor.replaceRange(translation, cursor);
                            const newPos = {
                                line: cursor.line,
                                ch: cursor.ch + translation.length
                            };
                            currentEditor.setCursor(newPos);
                            this.floatEditor = currentEditor;
                            console.log('✅ [Morse Translator] 已插入:', translation);
                        }
                        input.value = '';
                        hintPreview.textContent = '';
                        hintPreview.style.color = 'var(--text-muted)';
                        input.focus();
                    } else {
                        input.value = '';
                        hintPreview.textContent = '';
                    }
                }
            } else if (e.key === 'Escape') {
                this.closeTranslator();
            }
        };
        
        input.addEventListener('input', handleInput);
        input.addEventListener('keydown', handleKeydown);
        
        this.floatHandlers = { handleInput, handleKeydown };
        
        setTimeout(() => input.focus(), 100);
    }
    
    // 固定位置方法
    positionWindowStatic(container) {
        const windowWidth = container.offsetWidth || 280;
        const windowHeight = container.offsetHeight || 130;
        
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        let left = (viewportWidth - windowWidth) / 2;
        let top = (viewportHeight - windowHeight) / 3;
        
        left = Math.max(10, Math.min(left, viewportWidth - windowWidth - 10));
        top = Math.max(10, Math.min(top, viewportHeight - windowHeight - 10));
        
        console.log(`📐 [Morse Translator] 窗口固定定位: top=${top}px, left=${left}px`);
        
        container.style.position = 'fixed';
        container.style.top = `${top}px`;
        container.style.left = `${left}px`;
    }
    
    translateMorse(morse) {
        const words = morse.split(/\s+/);
        let translation = '';
        
        for (const word of words) {
            if (word === '') continue;
            const letters = word.split('/');
            let wordTrans = '';
            for (const letter of letters) {
                if (letter === '') continue;
                const char = MORSE_MAP[letter];
                if (char) {
                    wordTrans += char;
                } else {
                    wordTrans += '?';
                }
            }
            if (wordTrans) {
                if (translation) translation += ' ';
                translation += wordTrans;
            }
        }
        
        return translation;
    }
    
    closeFloatWindow() {
        if (this.floatWindow) {
            if (this.floatHandlers) {
                this.floatInput.removeEventListener('input', this.floatHandlers.handleInput);
                this.floatInput.removeEventListener('keydown', this.floatHandlers.handleKeydown);
            }
            this.floatWindow.remove();
            this.floatWindow = null;
            this.floatInput = null;
            this.floatHint = null;
            this.floatEditor = null;
            this.floatHandlers = null;
            this.floatAutoInsertCheckbox = null;
            this.floatCaseCheckbox = null;
            this.floatPanelContainer = null;
            this.floatToggleBtn = null;
            console.log('🗑️ [Morse Translator] 窗口已清理');
        }
    }
    
    onunload() {
        console.log('🔴 [Morse Translator] 插件卸载');
        if (this.autoInsertTimeout) {
            clearTimeout(this.autoInsertTimeout);
            this.autoInsertTimeout = null;
        }
        this.closeTranslator();
    }
}

const DEFAULT_SETTINGS = {
    dotChars: ['.', '．', '·'],  // 支持多个点字符
    dashChars: ['-', '—', '－'],  // 支持多个横字符
    deleteKeys: ['Backspace', 'Delete'],  // 删除按键，默认 Backspace 和 Delete
    newlineKeys: [],  // 换行按键，默认空（因为 Enter 用于确认翻译）
    autoOpen: false,
    autoInsert: false,      // 全局默认自动输入设置
    autoInsertDelay: 1000,   // 自动输入等待时间（毫秒），默认1秒
    language: 'zh-cn'       // 界面语言，默认中文
};

class MorseSettingTab extends PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
        this.windowStateButton = null;
        this.eventRef = null;
    }
    
    display() {
        const { containerEl } = this;
        containerEl.empty();
        
        containerEl.createEl('h2', { text: this.plugin.t('settingsTitle') });
        
        new Setting(containerEl)
            .setName(this.plugin.t('autoOpen'))
            .setDesc(this.plugin.t('autoOpenDesc'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.autoOpen)
                .onChange(async (value) => {
                    this.plugin.settings.autoOpen = value;
                    await this.plugin.saveSettings();
                    if (value && !this.plugin.isOpen) {
                        this.plugin.openTranslator();
                    } else if (!value && this.plugin.isOpen) {
                        this.plugin.closeTranslator();
                    }
                }));
        
        // 窗口状态控制按钮
        const windowStateSetting = new Setting(containerEl)
            .setName(this.plugin.t('windowState'))
            .setDesc(this.plugin.t('windowStateDesc'));
        
        const buttonEl = windowStateSetting.controlEl.createEl('button', {
            text: this.plugin.isOpen ? this.plugin.t('closeWindow') : this.plugin.t('openWindow')
        });
        buttonEl.style.cursor = 'pointer';
        buttonEl.style.padding = '4px 12px';
        buttonEl.style.borderRadius = '4px';
        buttonEl.style.border = '1px solid var(--background-modifier-border)';
        buttonEl.style.backgroundColor = 'var(--background-primary)';
        buttonEl.style.color = 'var(--text-normal)';
        
        buttonEl.addEventListener('click', async () => {
            if (this.plugin.isOpen) {
                this.plugin.closeTranslator();
                buttonEl.textContent = this.plugin.t('openWindow');
                new Notice(this.plugin.t('windowClosed'));
            } else {
                const editor = this.plugin.getActiveEditor();
                if (editor) {
                    this.plugin.openTranslator();
                    buttonEl.textContent = this.plugin.t('closeWindow');
                    new Notice(this.plugin.t('windowOpened'));
                } else {
                    new Notice(this.plugin.t('noticeCannotEdit'));
                }
            }
        });
        
        // 保存按钮引用，用于后续更新
        this.windowStateButton = buttonEl;
        
        // 注册事件监听，当窗口状态变化时更新按钮文字
        if (this.eventRef) {
            this.plugin.app.workspace.offref(this.eventRef);
        }
        this.eventRef = this.plugin.app.workspace.on('morse-translator-state-change', (isOpen) => {
            if (this.windowStateButton) {
                this.windowStateButton.textContent = isOpen ? this.plugin.t('closeWindow') : this.plugin.t('openWindow');
            }
        });
        
        new Setting(containerEl)
            .setName(this.plugin.t('defaultAutoInsert'))
            .setDesc(this.plugin.t('defaultAutoInsertDesc'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.autoInsert)
                .onChange(async (value) => {
                    this.plugin.settings.autoInsert = value;
                    await this.plugin.saveSettings();
                    // 如果当前窗口已打开，更新窗口内的开关状态
                    if (this.plugin.isOpen && this.plugin.floatAutoInsertCheckbox) {
                        this.plugin.windowAutoInsert = value;
                        this.plugin.floatAutoInsertCheckbox.checked = value;
                    }
                }));
        
        new Setting(containerEl)
            .setName(this.plugin.t('autoInsertDelay'))
            .setDesc(this.plugin.t('autoInsertDelayDesc'))
            .addSlider(slider => slider
                .setLimits(300, 5000, 100)
                .setValue(this.plugin.settings.autoInsertDelay)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.autoInsertDelay = value;
                    await this.plugin.saveSettings();
                }))
            .addText(text => {
                text.setValue(String(this.plugin.settings.autoInsertDelay));
                text.setPlaceholder('毫秒');
                text.inputEl.style.width = '60px';
                text.onChange(async (value) => {
                    const num = parseInt(value);
                    if (!isNaN(num) && num >= 300 && num <= 5000) {
                        this.plugin.settings.autoInsertDelay = num;
                        await this.plugin.saveSettings();
                        slider.setValue(num);
                    }
                });
            });
        
        new Setting(containerEl)
            .setName(this.plugin.t('dotChars'))
            .setDesc(this.plugin.t('dotCharsDesc'))
            .addText(text => text
                .setPlaceholder('. , ． , ·')
                .setValue(this.plugin.settings.dotChars.join(','))
                .onChange(async (value) => {
                    const chars = value.split(',').filter(c => c.trim().length > 0).map(c => c.trim());
                    if (chars.length > 0) {
                        this.plugin.settings.dotChars = chars;
                    } else {
                        this.plugin.settings.dotChars = ['.'];
                    }
                    await this.plugin.saveSettings();
                    // 更新输入框提示
                    if (this.plugin.floatInput) {
                        const placeholder = this.plugin.t('inputPlaceholder')
                            .replace('{dot}', this.plugin.settings.dotChars[0] || '.')
                            .replace('{dash}', this.plugin.settings.dashChars[0] || '-');
                        this.plugin.floatInput.placeholder = placeholder;
                    }
                }));
        
        new Setting(containerEl)
            .setName(this.plugin.t('dashChars'))
            .setDesc(this.plugin.t('dashCharsDesc'))
            .addText(text => text
                .setPlaceholder('- , — , －')
                .setValue(this.plugin.settings.dashChars.join(','))
                .onChange(async (value) => {
                    const chars = value.split(',').filter(c => c.trim().length > 0).map(c => c.trim());
                    if (chars.length > 0) {
                        this.plugin.settings.dashChars = chars;
                    } else {
                        this.plugin.settings.dashChars = ['-'];
                    }
                    await this.plugin.saveSettings();
                    // 更新输入框提示
                    if (this.plugin.floatInput) {
                        const placeholder = this.plugin.t('inputPlaceholder')
                            .replace('{dot}', this.plugin.settings.dotChars[0] || '.')
                            .replace('{dash}', this.plugin.settings.dashChars[0] || '-');
                        this.plugin.floatInput.placeholder = placeholder;
                    }
                }));
        
        // 删除按键设置
        new Setting(containerEl)
            .setName(this.plugin.t('deleteKeys'))
            .setDesc(this.plugin.t('deleteKeysDesc'))
            .addText(text => text
                .setPlaceholder('Backspace , Delete')
                .setValue((this.plugin.settings.deleteKeys || ['Backspace', 'Delete']).join(','))
                .onChange(async (value) => {
                    const keys = value.split(',').filter(k => k.trim().length > 0).map(k => k.trim());
                    this.plugin.settings.deleteKeys = keys.length > 0 ? keys : ['Backspace', 'Delete'];
                    await this.plugin.saveSettings();
                }));
        
        // 换行按键设置
        new Setting(containerEl)
            .setName(this.plugin.t('newlineKeys'))
            .setDesc(this.plugin.t('newlineKeysDesc'))
            .addText(text => text
                .setPlaceholder('例如: Ctrl+Enter , Shift+Enter , Cmd+Enter')
                .setValue((this.plugin.settings.newlineKeys || []).join(','))
                .onChange(async (value) => {
                    const keys = value.split(',').filter(k => k.trim().length > 0).map(k => k.trim());
                    this.plugin.settings.newlineKeys = keys;
                    await this.plugin.saveSettings();
                }));
        
        // 语言切换设置
        new Setting(containerEl)
            .setName(this.plugin.t('language'))
            .setDesc(this.plugin.t('languageDesc'))
            .addDropdown(dropdown => dropdown
                .addOption('zh-cn', this.plugin.t('languageZh'))
                .addOption('en', this.plugin.t('languageEn'))
                .setValue(this.plugin.settings.language || 'zh-cn')
                .onChange(async (value) => {
                    this.plugin.settings.language = value;
                    await this.plugin.saveSettings();
                    // 刷新设置页面
                    this.display();
                    // 刷新窗口文本（即时切换）
                    this.plugin.refreshWindowText();
                    new Notice(this.plugin.t('language') + ' → ' + (value === 'zh-cn' ? this.plugin.t('languageZh') : this.plugin.t('languageEn')));
                }));
        
        containerEl.createEl('p', { 
            text: this.plugin.t('usageText'), 
            cls: 'setting-item-description' 
        });
        
        const warningEl = containerEl.createEl('div', {
            cls: 'setting-item-description',
            text: this.plugin.t('warningText')
        });
        warningEl.style.color = 'var(--text-warning)';
        warningEl.style.marginTop = '12px';
    }
    
    hide() {
        // 清理事件监听，避免内存泄漏
        if (this.eventRef) {
            this.plugin.app.workspace.offref(this.eventRef);
            this.eventRef = null;
        }
        super.hide();
    }
}

module.exports = MorseTranslatorPlugin;