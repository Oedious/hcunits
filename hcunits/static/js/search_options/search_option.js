class SearchOption {
  constructor() {
  }

  static id() {
    throw new Error("Derived classes must implement SearchOption::id()")
  }

  static title() {
    throw new Error("Derived classes must implement SearchOption::title()")
  }

  draw() {
    throw new Error("Derived classes must implement SearchOption::draw()")
  }

  addOptionToQuery(query) {
    throw new Error("Derived classes must implement SearchOption::addOptionToQuery()")
  }
}