let currentCount = 0;
let isDrawing = false;

let lists = [];
let listIdCounter = 1;
let taskIdCounter = 1;
let editingTaskId = null;
let editingListId = null;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
ctx.strokeStyle = "#1D4ED8";
ctx.lineWidth = 3;
ctx.lineCap = "round";
ctx.lineJoin = "round";

const currentCountDisplay = document.getElementById("current-count");
const taskInput = document.getElementById("task-input");
const listSelect = document.getElementById("list-select");
const listsContainer = document.getElementById("lists-container");
const taskBtn = document.getElementById("taskBtn");
const newListModal = document.getElementById("new-list-modal");
const newListNameInput = document.getElementById("new-list-name");

canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseout", stopDrawing);
canvas.addEventListener("touchstart", handleTouch);
canvas.addEventListener("touchmove", handleTouch);
canvas.addEventListener("touchend", stopDrawing);

function startDrawing(e) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    currentCount++;
    updateCurrentCount();
}

function draw(e) {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
}

function stopDrawing() {
    isDrawing = false;
}

function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent(
        e.type === "touchstart" ? "mousedown" :
        e.type === "touchmove" ? "mousemove" : "mouseup",
        {
            clientX: touch.clientX,
            clientY: touch.clientY
        }
    );
    canvas.dispatchEvent(mouseEvent);
}

function updateCurrentCount() {
    currentCountDisplay.textContent = currentCount;
}

function addOne() {
    currentCount++;
    updateCurrentCount();
}

function minusOne() {
    if (currentCount > 0) {
        currentCount--;
        updateCurrentCount();
    }
}

function resetCounter() {
    currentCount = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateCurrentCount();
}

// LocalStorage
function saveLists() {
    localStorage.setItem("taskLists", JSON.stringify(lists));
    localStorage.setItem("listIdCounter", listIdCounter);
    localStorage.setItem("taskIdCounter", taskIdCounter);
}

function loadLists() {
    const saved = localStorage.getItem("taskLists");
    if (saved) {
        lists = JSON.parse(saved);
        listIdCounter = parseInt(localStorage.getItem("listIdCounter")) || 1;
        taskIdCounter = parseInt(localStorage.getItem("taskIdCounter")) || 1;
    }
}

// List Management
function showNewListDialog() {
    newListModal.classList.add("show");
    newListNameInput.value = "";
    newListNameInput.focus();
}

function closeNewListDialog() {
    newListModal.classList.remove("show");
}

function createNewList() {
    const listName = newListNameInput.value.trim();

    if (!listName) {
        alert("Please enter a list name");
        return;
    }

    const newList = {
        id: listIdCounter++,
        name: listName,
        tasks: []
    };

    lists.push(newList);
    closeNewListDialog();
    updateListSelect();
    renderLists();
    saveLists();
}

function deleteList(listId) {
    if (confirm("Delete this entire list and all its tasks?")) {
        lists = lists.filter(list => list.id !== listId);
        updateListSelect();
        renderLists();
        saveLists();
    }
}

function updateListSelect() {
    listSelect.innerHTML = '<option value="">Select list...</option>';
    lists.forEach(list => {
        const option = document.createElement("option");
        option.value = list.id;
        option.textContent = list.name;
        listSelect.appendChild(option);
    });
}

// Task Management
function addToList() {
    const taskName = taskInput.value.trim();
    const selectedListId = parseInt(listSelect.value);

    if (!taskName) {
        alert("Please enter a task name");
        return;
    }

    if (!selectedListId) {
        alert("Please select a list");
        return;
    }

    const list = lists.find(l => l.id === selectedListId);
    if (!list) return;

    if (editingTaskId !== null && editingListId === selectedListId) {
        const task = list.tasks.find(t => t.id === editingTaskId);
        if (task) {
            task.name = taskName;
            task.count = currentCount;
        }

        editingTaskId = null;
        editingListId = null;
        taskBtn.textContent = "Add";
        taskInput.placeholder = "Task to add...";
    } else {
        const newTask = {
            id: taskIdCounter++,
            name: taskName,
            count: currentCount
        };
        list.tasks.push(newTask);
    }

    resetCounter();
    taskInput.value = '';
    listSelect.value = '';
    renderLists();
    saveLists();
}

function editTask(listId, taskId) {
    const list = lists.find(l => l.id === listId);
    if (!list) return;

    const task = list.tasks.find(t => t.id === taskId);
    if (!task) return;

    taskInput.value = task.name;
    currentCount = task.count;
    updateCurrentCount();
    listSelect.value = listId;

    editingTaskId = taskId;
    editingListId = listId;
    taskBtn.textContent = "Update";
    taskInput.placeholder = "Edit task...";
    taskInput.focus();
}

function deleteTask(listId, taskId) {
    if (confirm("Delete this task?")) {
        const list = lists.find(l => l.id === listId);
        if (!list) return;

        list.tasks = list.tasks.filter(task => task.id !== taskId);

        if (editingTaskId === taskId && editingListId === listId) {
            editingTaskId = null;
            editingListId = null;
            taskBtn.textContent = "Add";
            taskInput.placeholder = "Task to add...";
            taskInput.value = "";
            listSelect.value = "";
            resetCounter();
        }

        renderLists();
        saveLists();
    }
}

function renderLists() {
    if (lists.length === 0) {
        listsContainer.innerHTML = '<p class="empty-message">No lists yet. Create a new list!</p>';
        return;
    }

    let html = '';
    lists.forEach(list => {
        html += `
        <div class="list-container">
            <div class="list-header">
                <span class="list-name">${list.name}</span>
                <div class="list-controls">
                    <button class="btn-delete-list" onclick="deleteList(${list.id})">Delete list</button>
                </div>
            </div>
            <div class="task-list">
        `;

        if (list.tasks.length === 0) {
            html += '<p style="color: #94A3B8; font-size: 14px; font-style: italic;">No tasks yet</p>';
        } else {
            list.tasks.forEach(task => {
                html += `
                <div class="task-item">
                    <div class="task-info">
                        <span class="task-name">${task.name}</span>
                        <span class="task-count">${task.count}</span>
                    </div>
                    <div class="task-buttons">
                        <button class="btn-edit" onclick="editTask(${list.id}, ${task.id})">Edit</button>
                        <button class="btn-delete" onclick="deleteTask(${list.id}, ${task.id})">Delete</button>
                    </div>
                </div>
                `;
            });
        }

        html += `</div></div>`;
    });

    listsContainer.innerHTML = html;
}

newListNameInput.addEventListener("keypress", function(e) {
    if (e.key === "Enter") createNewList();
});

newListModal.addEventListener("click", function(e) {
    if (e.target === newListModal) closeNewListDialog();
});

// Initialize
loadLists();
updateListSelect();
renderLists();
updateCurrentCount();