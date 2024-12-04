import Todo from './todos.js';
import Project from './projects.js';
import Masonry from 'masonry-layout';
import { compareAsc } from 'date-fns';
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns';

export default class UI {

    // general functions

    static createElement(parent, box, { id, classes, type, pattern, required, href, text, forLabel, checked } = {}) {
        const element = document.createElement(`${box}`);
        if (id) {
            element.setAttribute("id", id);
        }
        if (classes) {
            element.setAttribute("class", classes);
        }
        if (text) {
            element.textContent = text;
        }
        if (type) {
            element.setAttribute("type", type);
        }
        if (pattern) {
            element.setAttribute("pattern", pattern);
        }
        if (required) {
            element.setAttribute("required", "true");
        }
        if (href) {
            element.setAttribute("href", href);
        }
        if (forLabel) {
            element.setAttribute("for", forLabel);
        }
        if (checked) {
            element.setAttribute("checked", false);
        } 
        parent.appendChild(element);
        return element;
    }

    static sanitizeElement(input) {
        const normalized = input.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const noSpecialCaract = normalized.replace(/[^a-zA-Z0-9 ]/g, '');
        const withHyphens = noSpecialCaract.replace(/ /g, '-').toLowerCase();
        return withHyphens.replace(/^-+|-+$/g, '').replace(/-+/g, '-');
    }

    static getToday() {
        const todayStart = startOfDay(new Date());
        const todayEnd = endOfDay(new Date());
        return { todayStart, todayEnd };
    }
    
    static getThisWeek() {
        const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
        const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
        return { weekStart, weekEnd };
    }
    

    static loadPage() {
        this.loadNav();
        this.loadContent('home');
    }

    // TO DO LIST PROJECT

    // NAV

    static loadNav() {

        const body = document.body;
        const header = this.createElement(body, 'header');
        const nav = this.createElement(header, 'nav', {id: 'menu'});

        // title
        this.createElement(nav, 'h1', {text: 'Todo List'});

        // menu
        const ul = this.createElement(nav, 'ul');

        // main container
        this.createElement(body, 'div', { id: 'main-container' });
        
        // home section
        const homeLi = this.createElement(ul, 'li', { id: 'date-li' });
        const homeBtn = this.createElement(homeLi, 'button', { id: 'homeBtn', text: 'Home' });
        homeBtn.addEventListener('click', () => this.loadContent('home'));
        const homeDropdown = this.createElement(homeLi, 'ul', { classes: 'home-dropdown' });
        const todayBtn = this.createElement(homeDropdown, 'button', { text: 'Today' }, 'Today');
        todayBtn.addEventListener('click', () => this.loadContent('today'));
        const thisWeekBtn = this.createElement(homeDropdown, 'button', { text: 'This Week' }, 'This Week');
        thisWeekBtn.addEventListener('click', () => this.loadContent('this week'));
        const completedBtn = this.createElement(homeDropdown, 'button', { text: 'Completed' }, 'Completed');
        completedBtn.addEventListener('click', () => this.loadContent('completed'));
        
        // projects section
        const projectsLi = this.createElement(ul, 'li', { id: 'project-li' });
        const projectsBtn = this.createElement(projectsLi, 'button', { id: 'projectsBtn', text: 'Projects' });
        projectsBtn.addEventListener('click', () => this.loadContent('projects'));
        const projectDropdown = this.createElement(projectsLi, 'ul', { classes: 'project-dropdown' });
        this.loadProjectsToNavigation(projectDropdown);

        // div credits
        const credits = this.createElement(nav, 'p');
        this.createElement(credits, 'span', { text: 'made by ' });
        this.createElement(credits, 'a', { href: 'https://www.github.com/imulcei', text: '@imulcei' });
    }

    // load projects into navigation
    static loadProjectsToNavigation(projectDropdown) {
        const projects = Project.getProjects();
      
        projects.forEach(project => {
          const sanitizedTitle = this.sanitizeElement(project.title);
          const projectNavItem = this.createElement(projectDropdown, 'li', { 
            id: `nav-${sanitizedTitle}`,
            classes: 'project-nav-item' 
          });
          
          const projectNavBtn = this.createElement(projectNavItem, 'button', { 
            text: project.title,
            classes: 'project-nav-btn'
          });
          
          projectNavBtn.addEventListener('click', () => {
            this.loadContent('project', project);
          });
        });
      }

    // LOAD PAGES

    static loadContent(page) {
        const container = document.querySelector('#main-container');
        container.innerHTML = '';
        const todos = Todo.getTodos();
        let filteredTodos = [];
    
        switch (page) {
            case 'home':
                this.homePage(container);
                break;
            case 'projects':
                this.projectPage(container);
                break;
            case 'today':
                const { todayStart, todayEnd } = this.getToday();
                filteredTodos = todos.filter(todo => {
                    const todoDate = new Date(todo.dueDate);
                    return todoDate >= todayStart && todoDate <= todayEnd;
                });
                this.homePage(container, filteredTodos);
                break;
            case 'this week':
                const { weekStart, weekEnd } = this.getThisWeek();
                filteredTodos = todos.filter(todo => {
                    const todoDate = new Date(todo.dueDate);
                    return todoDate >= weekStart && todoDate <= weekEnd;
                });
                this.homePage(container, filteredTodos);
                break;
            case 'completed':
                filteredTodos = todos.filter(todo => todo.completed === true);
                this.homePage(container, filteredTodos);
                break;
            default:
                this.homePage(container);
        }
    }

    // HOME SECTION

    static homePage(container, todos = null) {
        
        // banner section
        const banner = this.createElement(container, 'div', { id: 'home-banner' });
        const todoButton = this.createElement(banner, 'button', { id: 'add-todo', classes: 'btn-banner', text: '+' });
        todoButton.addEventListener('click', () => { this.openTodoModal(); });
        this.createTodoModal(banner);

        // display todos section
        const allTodos = this.createElement(container, 'div', { id: 'all-todos'});

        // todos table + thead 
        const todoTable = this.createElement(allTodos, 'table', { id: 'todo-table' });
        const todoThead = this.createElement(todoTable, 'thead', { id: 'todo-thead' });
        this.createElement(todoThead, 'td', { id: 'todo-thead-name' });
        this.createElement(todoThead, 'td', { id: 'todo-thead-due-date', text : 'Due Date' });
        this.createElement(todoThead, 'td', { id: 'todo-thead-priority', text : 'Priority' });
        this.createElement(todoThead, 'td', { id: 'todo-thead-project', text : 'Project' });
        this.createElement(todoThead, 'td', { id: 'todo-thead-delete', text: 'Options' });

        this.createElement(todoTable, 'tbody', { id: 'todo-tbody' });

        // reload and display the todos
        const todosToDisplay = todos || Todo.getTodos();
        todosToDisplay.forEach(todo => this.createTodoItem(todo));
    }

    static openTodoModal() {
        const modalContainer = document.getElementById('modal-todo');
        if (modalContainer) { modalContainer.style.display = 'flex'; }
    }

    static createTodoModal(parent) {
        const modalContainer = this.createElement(parent, 'div', { id: 'modal-todo', classes: 'modal-common' });
        modalContainer.style.display = 'none';
        const modalContent = this.createElement(modalContainer, 'div', { id: 'modal-content', classes: 'common-modal' });

        // close button
        const closeModal = this.createElement(modalContent, 'button', { id: 'close-modal', classes: 'close-btn-modal', text: 'x' });
        closeModal.addEventListener('click', () => { modalContainer.style.display = 'none'; });

        // title
        this.createElement(modalContent, 'h2', { text: 'Add a todo' });

        // add todo form
        const form = this.createElement(modalContent, 'form', { id: 'todo-form', classes: 'modal-form' });
        this.createElement(form, 'label', { text: 'Title', forLabel: 'todo-title' });
        const titleInput = this.createElement(form, 'input', { type: 'text', id: 'todo-title', pattern: '[a-zA-Z\\s]+', required: true });

        this.createElement(form, 'label', { text: 'Description', forLabel: 'todo-description' });
        const descriptionInput = this.createElement(form, 'textarea', { id: 'todo-description', pattern: '[a-zA-Z\\s]+' });

        this.createElement(form, 'label', { text: 'Due Date', forLabel: 'todo-due-date' });
        const dueDateInput = this.createElement(form, 'input', { type: 'date', id: 'todo-due-date', required: true });
        document.getElementById("todo-due-date").min = new Date().toISOString().split("T")[0];

        this.createElement(form, 'label', { text: 'Priority', forLabel: 'todo-priority' });
        const priorityInput = this.createElement(form, 'select', { id: 'todo-priority', required: true });
        ['Low', 'Medium', 'High'].forEach((priority) => {
            this.createElement(priorityInput, 'option', { value: priority, text: priority });
        });

        this.createElement(form, 'label', { text: 'Project',  forLabel: 'todo-project' });
        const projectInput = this.createElement(form, 'select', { id: 'todo-project' });
        const projects = Project.getProjects();
        projects.forEach(project => { this.createElement(projectInput, 'option', { value: project.title, text: project.title }) });

        // add todo button
        const addButton = this.createElement(form, 'button', { type: 'submit', classes: 'add-btn-modal', text: 'Add Todo' });
        addButton.addEventListener('click', (e) => {
            e.preventDefault();

            const title = titleInput.value.trim();
            const description = descriptionInput.value.trim();
            const dueDate = dueDateInput.value.trim();
            const priority = priorityInput.value || 'Low';
            const project = projectInput.value;

            let isValid = true;

            if (!title || !dueDate || !priority) { alert("Title, Due Date are necessery."); isValid = false; return; }
            if (isNaN(Date.parse(dueDate))) { alert("Please provide a valid date."); return; }

            if (isValid) {
                Todo.addTodo(title, description, dueDate, priority, project);
                this.displayTodos();
                modalContainer.style.display = 'none';
                titleInput.value = '';
                descriptionInput.value = '';
                dueDateInput.value = '';
                priorityInput.value = '';
                projectInput.value = '';
            }
        });

    }

    static displayTodos() {
        const todos = Todo.getTodos();
        todos.sort((todo1, todo2) => 
            compareAsc(new Date(todo1.dueDate), new Date(todo2.dueDate))
        );
        const tableBody = document.querySelector('#todo-tbody');
        tableBody.innerHTML = '';
        todos.forEach(todo => {
            this.createTodoItem(todo);
        });
    }

    static createTodoItem(todo) {
        const todoBody = document.querySelector('#todo-tbody');
        
        // todo table row
        const row = this.createElement(todoBody, 'tr', { classes: 'todo-row'});
        // todo table columns
        const titleProject = this.createElement(row, 'td', { id: 'todo-cell-name', classes: 'td', text: `${todo.title} +`});
        this.createElement(row, 'td', { id: 'todo-cell-due-date', classes: 'td', text: todo.dueDate });
        const priorityCell = this.createElement(row, 'td', { id: 'todo-cell-priority', classes: 'td', text: todo.priority });
        const priority = todo.priority ? todo.priority.toLowerCase() : 'low';
        this.createElement(priorityCell, 'span', { classes: `priority-dot ${priority}`, text: ' ◉' });
        this.createElement(row, 'td', { id: 'todo-cell-project', classes: 'td', text: todo.project });

        // options cell 
        const optionsCell = this.createElement(row, 'td', { id: 'todo-cell-delete', classes: 'td' });

        const completedCell = this.createElement(optionsCell, 'div', { id: 'todo-cell-completed'});
        const sanitizedCheckbox = this.sanitizeElement(todo.title);
        this.createElement(completedCell, 'label', { text: 'Done?', forLabel: `input-completed-${sanitizedCheckbox}` });
        const todoCheckbox = this.createElement(completedCell, 'input', { id: `input-completed-${sanitizedCheckbox}`, type: 'checkbox' });
        todoCheckbox.checked = todo.completed;
        todoCheckbox.addEventListener('change', () => {
            // todo.completed = todoCheckbox.checked;
            const todoIndex = Todo.todos.findIndex(t => 
                t.title === todo.title && 
                t.description === todo.description && 
                t.dueDate === todo.dueDate
            );
        
            if (todoIndex !== -1) {
            Todo.todos[todoIndex].completed = todoCheckbox.checked;
            Todo.saveTodos();
            }
        })

        const deleteButton = this.createElement(optionsCell, 'button', { text: 'Delete' });
        deleteButton.addEventListener('click', () => {
            Todo.deleteTodo(todo);
            row.remove();
        });

        // display description
        const nameCell = row.querySelector('#todo-cell-name');
        nameCell.addEventListener('click', () => {
            const alreadyARow = row.nextElementSibling;
            if (alreadyARow && alreadyARow.id === 'todo-cell-desc') {
                alreadyARow.remove();
                const todoNameCell = row.querySelector('#todo-cell-name');
                todoNameCell.innerHTML = `${todo.title} +`;
            } else {
                const detailsRow = this.createElement(todoBody, 'tr', { id: 'todo-cell-desc' });
                const detailsCell = this.createElement(detailsRow, 'td', { classes: 'td', text: `Description: ${todo.description}` });
                detailsCell.setAttribute('colspan', '5');
                const todoNameCell = row.querySelector('#todo-cell-name');
                todoNameCell.innerHTML = `${todo.title} -`;
                row.insertAdjacentElement('afterend', detailsRow);
            }
        });
        
        todoBody.appendChild(row);
    }

    // PROJECT SECTION

    static projectPage(container) {
                
        // banner section
        const banner = this.createElement(container, 'div', { id: 'project-banner' });
        const projectButton = this.createElement(banner, 'button', { id: 'add-project', classes: 'btn-banner', text: '+' });
        projectButton.addEventListener('click', () => {
            this.openProjectModal();
        });
        this.createProjectModal(banner);

        // display projects section
        const allProjects = this.createElement(container, 'div', { id: 'all-projects'});
        this.displayProjects(allProjects);

        console.log(Project.getProjects());

    }

    static openProjectModal() {
        const projectContainer = document.getElementById('modal-project');
        if (projectContainer) { projectContainer.style.display = 'flex'; }
    }

    static createProjectModal(parent) {
        const projectContainer = this.createElement(parent, 'div', { id: 'modal-project', classes: 'modal-common' });
        projectContainer.style.display = 'none';
        const projectContent = this.createElement(projectContainer, 'div', { id: 'project-content', classes: 'common-modal' });

        // close button
        const closeModal = this.createElement(projectContent, 'button', { id: 'close-modal', classes: 'close-btn-modal', text: 'x' });
        closeModal.addEventListener('click', () => { projectContainer.style.display = 'none'; });

        // title
        this.createElement(projectContent, 'h2', { text: 'Add a project'});

        // add project form
        const form = this.createElement(projectContent, 'form', { id: 'project-form', classes: 'modal-form' });
        this.createElement(form, 'label', { text: 'Title', forLabel: 'project-title' });
        const titleProjectInput = this.createElement(form, 'input', { type: 'text', id: 'project-title', pattern: '[a-zA-Z\\s]+', required: true });

        const addButton = this.createElement(form, 'button', { type: 'submit', classes: 'add-btn-modal', text: 'Add Project' });
        addButton.addEventListener('click', (e) => {
            e.preventDefault();

            const title = titleProjectInput.value.trim();

            let isValid = true;

            if (!title) { alert("Title is necessery."); isValid = false; return; }

            if (isValid) {
                Project.addProject(title);
                const allProjects = document.querySelector("#all-projects");
                this.displayProjects(allProjects);
                const projectsDropdown = document.querySelector('.project-dropdown');
                console.log(Project.getProjects());
                if (projectsDropdown) {
                    projectsDropdown.innerHTML = '';
                    const projects = Project.getProjects();
                    projects.forEach(project => {
                        const sanitizedTitle = this.sanitizeElement(project.title);
                        this.createElement(projectsDropdown, 'li', { id: `nav-${sanitizedTitle}`, text: `${project.title}`});
                    });
                }
                projectContainer.style.display = 'none';
            }

            titleProjectInput.value = '';
        });

    }

    static createProjectItem(parent, project) {
        const projectItem = this.createElement(parent, 'div', { classes: 'project-item' });

        // delete button
        const deleteButton = this.createElement(projectItem, 'button', { text: 'x', classes: 'close-btn-modal' });
        deleteButton.addEventListener('click', () => {
            Project.deleteProject(project);
            
            const todos = Todo.getTodos();

            const updatedTodos = todos.filter(todo => {
              if (todo.project === project.title) {
                todo.project = null;
              }
              return true;
            });
            
            Todo.todos = updatedTodos;
            Todo.saveTodos();
            
            projectItem.remove();
            
            const grid = document.querySelector('#all-projects');
            const msnry = new Masonry(grid, {
              itemSelector: '.project-item',
              columnWidth: 200,
              horizontalOrder: true,
              gutter: 20
            });
            msnry.reloadItems();
            msnry.layout();
            
            const sanitizedTitle = this.sanitizeElement(project.title);
            const idProject = document.querySelector(`#nav-${sanitizedTitle}`);
            if (idProject) {
              idProject.remove();
            } else {
              console.warn(`Navigation item for project ${project.title} not found`);
            }
          });
    
        // title
        this.createElement(projectItem, 'h3', { text: project.title });

        // todos' project
        this.createElement(projectItem, 'div', { id: 'todos-proj-container' });

        // mansory layout for projects items
        const grid = document.querySelector('#all-projects'); 
        const msnry = new Masonry(grid, {
            itemSelector: '.project-item', 
            columnWidth: 200, 
            horizontalOrder: true, 
            gutter: 20, 
        });

        msnry.reloadItems();
        msnry.layout();
    }

    static displayProjects(parent) {
        const projects = Project.getProjects();
        parent.innerHTML = '';
        projects.forEach(project => {
            this.createProjectItem(parent, project);
            // todos' project
            const todos = Todo.getTodos();
            const todosContainer = document.querySelector('#todos-proj-container');
            const projectTodos = todos.filter(todo => todo.project === project.title);
            if (projectTodos.length > 0) {
                projectTodos.forEach(todo => {
                    const pTodo = this.createElement(todosContainer, 'p', { text: `${todo.dueDate}:  ${todo.title}` });
                    if (todo.completed === true) {
                        pTodo.innerHTML = '<s>' + pTodo.innerHTML + '</s>';
                    }
                });
            } else {
                this.createElement(todosContainer, 'p', { text: ' ' });
            }
        });
    }
}