
// Exception logging
class StateBranch {
  constructor(message, level = 'INFO', maxHistory = 100, printing = 1) {
    this.errors = [];
    this.time = new Date().toISOString();
    const levels = ['INFO', 'WARN', 'ERR'];
    this.maxLevel = levels.includes(level) ? level : 'INFO';
    this.handled = false;
    this.message = message;
    this.maxHistory = maxHistory;
    this.printing = printing;
  }

  commitStatus(errObject) {
    const levels = ['INFO', 'WARN', 'ERR'];
    // Validations
    if (!errObject || typeof errObject !== 'object' || Array.isArray(errObject)) {
      this.maxLevel = 'ERR';
      this.pushStatus({
        level: 'ERR',
        message: 'Validation failed: Input must be an object.'
      });
      return 0;
    }

    const { level, message } = errObject;

    if (typeof level !== 'string' || typeof message !== 'string' || !levels.includes(level)) {
      this.maxLevel = 'ERR';
      this.pushStatus({
        level: 'ERR',
        message: 'Validation failed: level and message must be strings, and level must be INFO, WARN, or ERR.'
      });
      return 0;
    }
    this.pushStatus({ level, message });
  }

  pushStatus(errObject) {
    if (this.errors.length >= this.maxHistory) 
      this.errors.shift();
    this.errors.push(errObject);

    if (this.printing === 1) 
        console.log(errObject);
  }

  getLatestStatus() {
    return `[${this.time}] [${this.maxLevel}] ${this.message} | Handled: ${this.handled} | Errors: ${this.errors.length}`;
  }

  getAll() {
    return this.errors;
  }

  setPrinting(printing) {
    this.printing = printing; // 0 or 1
  }

  printAll() {
    console.log(this.errors);
  }
}

// Exports believe it or not
export { StateBranch };
