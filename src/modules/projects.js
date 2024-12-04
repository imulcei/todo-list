export default class Project {
    static projects = this.loadProjects();

    // add a project
    static addProject(title) {
        const project = {title, todo: []};
        this.projects.push(project);
        this.saveProjects();
    }

    // get all the project
    static getProjects() { return this.projects; };

    // delete a project
    static deleteProject(projectToDelete) { 
        this.projects = this.projects.filter( project => project !== projectToDelete );
        this.saveProjects(); 
    }

    // load projects from localstorage
    static loadProjects() {
        const storedProjects = localStorage.getItem('projects');
        return storedProjects ? JSON.parse(storedProjects) : [];
    }

    // save projects in the localstorage
    static saveProjects() {
        localStorage.setItem('projects', JSON.stringify(this.projects));
    }

    // add a todo to a project
    static addTodoToProject(projectTitle, todo) {
        const project = this.projects.find(p => p.title === projectTitle);
        if (project) {
            project.todos.push(todo);
            this.saveProjects();
        }
    }

    // delete a todo from project
    static deleteTodoFromProject(projectTitle, todoToDelete) {
        const project = this.projects.find(p => p.title === projectTitle);
        if (project) {
          project.todos = project.todos.filter(todo => todo !== todoToDelete);
          this.saveProjectsToStorage();
        }
    }
}