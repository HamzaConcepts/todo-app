class TodoApp {
    constructor() {
        this.tasks = this.loadTasks();
        this.taskIdCounter = this.getNextTaskId();
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderAllTasks();
        this.updateTaskCounts();
    }

    bindEvents() {
        // Add todo button and enter key
        const addBtn = document.getElementById('addTodoBtn');
        const todoInput = document.getElementById('todoInput');
        
        addBtn.addEventListener('click', () => this.addTask());
        todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });

        // Drag and drop events
        this.setupDragAndDrop();
    }

    addTask() {
        const input = document.getElementById('todoInput');
        const taskText = input.value.trim();
        
        if (!taskText) {
            this.showMessage('Please enter a task', 'error');
            return;
        }

        const task = {
            id: this.taskIdCounter++,
            text: taskText,
            status: 'todo',
            createdAt: new Date().toISOString()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderTask(task);
        this.updateTaskCounts();
        
        input.value = '';
        this.showMessage('Task added successfully!', 'success');
    }

    renderTask(task, animate = true) {
        const taskElement = this.createTaskElement(task);
        const targetList = document.getElementById(this.getListId(task.status));
        
        if (animate) {
            taskElement.classList.add('new-task');
        }
        
        targetList.appendChild(taskElement);
    }

    renderAllTasks() {
        // Clear all lists
        document.getElementById('todoList').innerHTML = '';
        document.getElementById('inprogressList').innerHTML = '';
        document.getElementById('doneList').innerHTML = '';

        // Render tasks in their respective columns
        this.tasks.forEach(task => this.renderTask(task, false));
    }

    createTaskElement(task) {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'task';
        taskDiv.draggable = true;
        taskDiv.dataset.taskId = task.id;

        const actions = this.getTaskActions(task.status);

        taskDiv.innerHTML = `
            <div class="task-content">${this.escapeHtml(task.text)}</div>
            <div class="task-actions">
                ${actions}
                <button class="move-btn delete-btn" onclick="todoApp.deleteTask(${task.id})">Delete</button>
            </div>
        `;

        // Add drag event listeners
        taskDiv.addEventListener('dragstart', (e) => this.handleDragStart(e));
        taskDiv.addEventListener('dragend', (e) => this.handleDragEnd(e));

        return taskDiv;
    }

    getTaskActions(status) {
        switch (status) {
            case 'todo':
                return `<button class="move-btn move-to-progress" onclick="todoApp.moveTask(${arguments[1] || 'this.dataset.taskId'}, 'inprogress')">Start</button>`;
            case 'inprogress':
                return `
                    <button class="move-btn move-to-todo" onclick="todoApp.moveTask(${arguments[1] || 'this.dataset.taskId'}, 'todo')">Back</button>
                    <button class="move-btn move-to-done" onclick="todoApp.moveTask(${arguments[1] || 'this.dataset.taskId'}, 'done')">Complete</button>
                `;
            case 'done':
                return `<button class="move-btn move-to-todo" onclick="todoApp.moveTask(${arguments[1] || 'this.dataset.taskId'}, 'todo')">Reopen</button>`;
            default:
                return '';
        }
    }

    // Fix the getTaskActions method to properly handle task IDs
    createTaskElement(task) {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'task';
        taskDiv.draggable = true;
        taskDiv.dataset.taskId = task.id;

        let actions = '';
        switch (task.status) {
            case 'todo':
                actions = `<button class="move-btn move-to-progress" onclick="todoApp.moveTask(${task.id}, 'inprogress')">Start</button>`;
                break;
            case 'inprogress':
                actions = `
                    <button class="move-btn move-to-todo" onclick="todoApp.moveTask(${task.id}, 'todo')">Back</button>
                    <button class="move-btn move-to-done" onclick="todoApp.moveTask(${task.id}, 'done')">Complete</button>
                `;
                break;
            case 'done':
                actions = `<button class="move-btn move-to-todo" onclick="todoApp.moveTask(${task.id}, 'todo')">Reopen</button>`;
                break;
        }

        taskDiv.innerHTML = `
            <div class="task-content">${this.escapeHtml(task.text)}</div>
            <div class="task-actions">
                ${actions}
                <button class="move-btn delete-btn" onclick="todoApp.deleteTask(${task.id})">Delete</button>
            </div>
        `;

        // Add drag event listeners
        taskDiv.addEventListener('dragstart', (e) => this.handleDragStart(e));
        taskDiv.addEventListener('dragend', (e) => this.handleDragEnd(e));

        return taskDiv;
    }

    moveTask(taskId, newStatus) {
        const task = this.tasks.find(t => t.id == taskId);
        if (!task) return;

        task.status = newStatus;
        this.saveTasks();
        this.renderAllTasks();
        this.updateTaskCounts();
        
        this.showMessage(`Task moved to ${this.getStatusDisplayName(newStatus)}!`, 'success');
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id != taskId);
            this.saveTasks();
            this.renderAllTasks();
            this.updateTaskCounts();
            this.showMessage('Task deleted successfully!', 'success');
        }
    }

    setupDragAndDrop() {
        const lists = document.querySelectorAll('.task-list');
        
        lists.forEach(list => {
            list.addEventListener('dragover', (e) => this.handleDragOver(e));
            list.addEventListener('drop', (e) => this.handleDrop(e));
            list.addEventListener('dragenter', (e) => this.handleDragEnter(e));
            list.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        });
    }

    handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.dataset.taskId);
        e.target.classList.add('dragging');
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    handleDragEnter(e) {
        e.preventDefault();
        if (e.target.classList.contains('task-list')) {
            e.target.classList.add('drag-over');
        }
    }

    handleDragLeave(e) {
        if (e.target.classList.contains('task-list') && !e.target.contains(e.relatedTarget)) {
            e.target.classList.remove('drag-over');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('text/plain');
        const targetList = e.target.closest('.task-list');
        
        if (targetList) {
            targetList.classList.remove('drag-over');
            const newStatus = this.getStatusFromListId(targetList.id);
            this.moveTask(taskId, newStatus);
        }
    }

    updateTaskCounts() {
        const columns = document.querySelectorAll('.column');
        columns.forEach(column => {
            const status = column.dataset.column;
            const count = this.tasks.filter(task => task.status === this.getStatusFromColumn(status)).length;
            const countElement = column.querySelector('.task-count');
            countElement.textContent = count;
        });
    }

    getStatusFromColumn(columnType) {
        const statusMap = {
            'todo': 'todo',
            'inprogress': 'inprogress',
            'done': 'done'
        };
        return statusMap[columnType];
    }

    getStatusFromListId(listId) {
        const statusMap = {
            'todoList': 'todo',
            'inprogressList': 'inprogress',
            'doneList': 'done'
        };
        return statusMap[listId];
    }

    getListId(status) {
        const listMap = {
            'todo': 'todoList',
            'inprogress': 'inprogressList',
            'done': 'doneList'
        };
        return listMap[status];
    }

    getStatusDisplayName(status) {
        const displayMap = {
            'todo': 'To Do',
            'inprogress': 'In Progress',
            'done': 'Done'
        };
        return displayMap[status];
    }

    // Local storage methods
    saveTasks() {
        localStorage.setItem('todoAppTasks', JSON.stringify(this.tasks));
        localStorage.setItem('todoAppTaskCounter', this.taskIdCounter.toString());
    }

    loadTasks() {
        const saved = localStorage.getItem('todoAppTasks');
        return saved ? JSON.parse(saved) : [];
    }

    getNextTaskId() {
        const saved = localStorage.getItem('todoAppTaskCounter');
        return saved ? parseInt(saved) : 1;
    }

    // Utility methods
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showMessage(message, type = 'info') {
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;
        
        // Style the message
        Object.assign(messageDiv.style, {
            position: 'fixed',
            top: '24px',
            right: '24px',
            padding: '12px 16px',
            borderRadius: '6px',
            color: 'white',
            fontWeight: '500',
            fontSize: '14px',
            zIndex: '1000',
            transform: 'translateX(100%)',
            transition: 'transform 0.2s ease',
            maxWidth: '320px',
            wordWrap: 'break-word',
            border: '1px solid rgba(255, 255, 255, 0.1)'
        });

        // Set background color based on type
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#007bff'
        };
        messageDiv.style.backgroundColor = colors[type] || colors.info;

        // Add to page
        document.body.appendChild(messageDiv);

        // Animate in
        setTimeout(() => {
            messageDiv.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            messageDiv.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, 3000);
    }

    // Export/Import functionality (bonus feature)
    exportTasks() {
        const dataStr = JSON.stringify(this.tasks, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'todo-tasks.json';
        link.click();
        
        URL.revokeObjectURL(url);
        this.showMessage('Tasks exported successfully!', 'success');
    }

    importTasks(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedTasks = JSON.parse(e.target.result);
                this.tasks = importedTasks;
                this.saveTasks();
                this.renderAllTasks();
                this.updateTaskCounts();
                this.showMessage('Tasks imported successfully!', 'success');
            } catch (error) {
                this.showMessage('Error importing tasks. Please check the file format.', 'error');
            }
        };
        reader.readAsText(file);
    }
}

// Initialize the app when the page loads
let todoApp;
document.addEventListener('DOMContentLoaded', () => {
    todoApp = new TodoApp();
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to quickly add a task
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const input = document.getElementById('todoInput');
        if (document.activeElement !== input) {
            input.focus();
        } else {
            todoApp.addTask();
        }
    }
    
    // Escape to clear input
    if (e.key === 'Escape') {
        const input = document.getElementById('todoInput');
        if (document.activeElement === input) {
            input.value = '';
            input.blur();
        }
    }
});