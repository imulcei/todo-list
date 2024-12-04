export default class Todo {
    static todos = this.loadTodos();

    // add a todo
    static addTodo(title, description, dueDate, priority, project) {
        const todo = { title, description, dueDate, priority, project, completed : false };
        this.todos.push(todo);
        this.saveTodos();
    }

    // get all the todos
    static getTodos() { return this.todos; };

    // delete a todo
    static deleteTodo(todoToDelete) { 
        // this.todos = this.todos.filter( todo => todo !== todoToDelete);
        this.todos = this.todos.filter(todo => 
            !(todo.title === todoToDelete.title && 
              todo.description === todoToDelete.description && 
              todo.dueDate === todoToDelete.dueDate)
        );
        this.saveTodos();
    };

    // load todos from localstorage
    static loadTodos() {
        const storedTodos = localStorage.getItem('todos');
        return storedTodos ? JSON.parse(storedTodos) .map(todo => ({
            ...todo,
            completed: todo.completed || false
        })) : [];
    }

    // save todos in the localstorage
    static saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    // mark a todo as completed
    static markAsCompleted(todoToComplete) {
        const index = this.todos.indexOf(todoToComplete);
        if (index !== -1) {
            this.todos[index].completed = true;
            this.saveTodos();
        }
    }
}