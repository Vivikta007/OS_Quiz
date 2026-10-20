export const questions = [
  // =========================================================
  // OS BASICS
  // =========================================================

  {
    id: 1,
    question: "What is the main purpose of an Operating System?",
    options: [
      "Manage computer resources",
      "Create websites",
      "Design hardware",
      "Write application code",
    ],
    correctAnswer: "A",
    topic: "OS Basics",
    difficulty: "Easy",
  },

  {
    id: 2,
    question: "Which of the following is an Operating System?",
    options: ["Microsoft Word", "Linux", "Google Chrome", "MySQL"],
    correctAnswer: "B",
    topic: "OS Basics",
    difficulty: "Easy",
  },

  {
    id: 3,
    question: "Which component manages processes in an Operating System?",
    options: ["Process Scheduler", "Compiler", "Web Browser", "Text Editor"],
    correctAnswer: "A",
    topic: "OS Basics",
    difficulty: "Easy",
  },

  {
    id: 4,
    question:
      "Which of the following is responsible for managing hardware resources?",
    options: ["Operating System", "Web Browser", "Compiler", "Database"],
    correctAnswer: "A",
    topic: "OS Basics",
    difficulty: "Easy",
  },

  {
    id: 5,
    question:
      "Which part of the Operating System remains in memory while the system is running?",
    options: ["Kernel", "Text Editor", "Shell Script", "Compiler"],
    correctAnswer: "A",
    topic: "OS Basics",
    difficulty: "Easy",
  },

  {
    id: 6,
    question: "What is a process?",
    options: [
      "A program in execution",
      "A file stored on disk",
      "A hardware device",
      "A compiler",
    ],
    correctAnswer: "A",
    topic: "OS Basics",
    difficulty: "Easy",
  },

  {
    id: 7,
    question:
      "Which data structure is commonly used to maintain the ready queue?",
    options: ["Queue", "Stack", "Tree", "Graph"],
    correctAnswer: "A",
    topic: "CPU Scheduling",
    difficulty: "Easy",
  },

  {
    id: 8,
    question:
      "Which scheduling algorithm executes processes in the order they arrive?",
    options: ["FCFS", "SJF", "Round Robin", "Priority Scheduling"],
    correctAnswer: "A",
    topic: "CPU Scheduling",
    difficulty: "Easy",
  },

  {
    id: 9,
    question: "Which CPU scheduling algorithm uses a time quantum?",
    options: ["FCFS", "Round Robin", "SJF", "Priority Scheduling"],
    correctAnswer: "B",
    topic: "CPU Scheduling",
    difficulty: "Easy",
  },

  {
    id: 10,
    question:
      "Which scheduling algorithm selects the process with the shortest CPU burst?",
    options: ["FCFS", "Round Robin", "SJF", "FIFO"],
    correctAnswer: "C",
    topic: "CPU Scheduling",
    difficulty: "Easy",
  },

  {
    id: 11,
    question: "What does CPU burst time represent?",
    options: [
      "Time required by a process for CPU execution",
      "Time spent waiting for I/O",
      "Time required to boot the OS",
      "Time required to shut down the system",
    ],
    correctAnswer: "A",
    topic: "CPU Scheduling",
    difficulty: "Easy",
  },

  {
    id: 12,
    question: "What is starvation in CPU scheduling?",
    options: [
      "A process waits indefinitely for CPU time",
      "A process finishes too quickly",
      "The CPU becomes permanently damaged",
      "Memory becomes empty",
    ],
    correctAnswer: "A",
    topic: "CPU Scheduling",
    difficulty: "Medium",
  },

  {
    id: 13,
    question:
      "Which scheduling algorithm is most suitable for time-sharing systems?",
    options: ["FCFS", "Round Robin", "SJF", "FIFO"],
    correctAnswer: "B",
    topic: "CPU Scheduling",
    difficulty: "Easy",
  },

  {
    id: 14,
    question: "What is a thread?",
    options: [
      "The smallest unit of CPU execution within a process",
      "A type of hard disk",
      "A memory partition",
      "A system call",
    ],
    correctAnswer: "A",
    topic: "Processes & System Calls",
    difficulty: "Easy",
  },

  {
    id: 15,
    question: "What is a context switch?",
    options: [
      "Switching the CPU from one process or thread to another",
      "Switching from RAM to ROM",
      "Changing the operating system",
      "Changing a file extension",
    ],
    correctAnswer: "A",
    topic: "CPU Scheduling",
    difficulty: "Medium",
  },

  // =========================================================
  // PROCESS SYNCHRONIZATION
  // =========================================================

  {
    id: 16,
    question: "What is a critical section?",
    options: [
      "A section of code that accesses shared resources",
      "A section of memory used only by the OS",
      "A section of the hard disk",
      "A section of the boot process",
    ],
    correctAnswer: "A",
    topic: "Process Synchronization",
    difficulty: "Easy",
  },

  {
    id: 17,
    question: "Which mechanism is commonly used for process synchronization?",
    options: ["Semaphore", "Compiler", "Cache", "Loader"],
    correctAnswer: "A",
    topic: "Process Synchronization",
    difficulty: "Easy",
  },

  {
    id: 18,
    question: "A binary semaphore can have which values?",
    options: ["0 and 1", "1 and 2", "-1 and 1", "0 and 2"],
    correctAnswer: "A",
    topic: "Process Synchronization",
    difficulty: "Easy",
  },

  {
    id: 19,
    question: "What problem does mutual exclusion solve?",
    options: [
      "Prevents multiple processes from entering a critical section simultaneously",
      "Prevents memory allocation",
      "Prevents process creation",
      "Prevents CPU scheduling",
    ],
    correctAnswer: "A",
    topic: "Process Synchronization",
    difficulty: "Easy",
  },

  {
    id: 20,
    question:
      "Which algorithm is used to solve the mutual exclusion problem for multiple processes?",
    options: [
      "Bakery Algorithm",
      "Dijkstra Algorithm",
      "Kruskal Algorithm",
      "Binary Search",
    ],
    correctAnswer: "A",
    topic: "Process Synchronization",
    difficulty: "Medium",
  },

  // =========================================================
  // DEADLOCKS
  // =========================================================

  {
    id: 21,
    question:
      "Which of the following is NOT a necessary condition for deadlock?",
    options: [
      "Mutual exclusion",
      "Hold and wait",
      "Circular wait",
      "Fast execution",
    ],
    correctAnswer: "D",
    topic: "Deadlocks",
    difficulty: "Easy",
  },

  {
    id: 22,
    question:
      "Which condition occurs when processes hold resources while waiting for additional resources?",
    options: ["Hold and wait", "Mutual exclusion", "Preemption", "Scheduling"],
    correctAnswer: "A",
    topic: "Deadlocks",
    difficulty: "Easy",
  },

  {
    id: 23,
    question: "Which algorithm is used for deadlock avoidance?",
    options: ["Banker's Algorithm", "FCFS", "Round Robin", "FIFO"],
    correctAnswer: "A",
    topic: "Deadlocks",
    difficulty: "Easy",
  },

  {
    id: 24,
    question: "What is a deadlock?",
    options: [
      "A situation where processes wait indefinitely for resources",
      "A process completing normally",
      "A CPU scheduling method",
      "A type of memory",
    ],
    correctAnswer: "A",
    topic: "Deadlocks",
    difficulty: "Easy",
  },

  // =========================================================
  // MEMORY MANAGEMENT
  // =========================================================

  {
    id: 25,
    question: "What is paging?",
    options: [
      "A memory management technique that divides memory into fixed-size blocks",
      "A CPU scheduling algorithm",
      "A file management technique",
      "A synchronization algorithm",
    ],
    correctAnswer: "A",
    topic: "Memory Management",
    difficulty: "Easy",
  },

  {
    id: 26,
    question: "What is a page in memory management?",
    options: [
      "A fixed-size block of logical memory",
      "A CPU register",
      "A process",
      "A file",
    ],
    correctAnswer: "A",
    topic: "Memory Management",
    difficulty: "Easy",
  },

  {
    id: 27,
    question: "What is a frame?",
    options: [
      "A fixed-size block of physical memory",
      "A logical memory address",
      "A process state",
      "A CPU instruction",
    ],
    correctAnswer: "A",
    topic: "Memory Management",
    difficulty: "Easy",
  },

  {
    id: 28,
    question: "What is a page fault?",
    options: [
      "When a required page is not present in main memory",
      "When the CPU stops working",
      "When a process terminates",
      "When a file is deleted",
    ],
    correctAnswer: "A",
    topic: "Memory Management",
    difficulty: "Easy",
  },

  {
    id: 29,
    question:
      "Which technique allows a process to use more memory than physically available in RAM?",
    options: ["Virtual Memory", "Caching", "Spooling", "Buffering"],
    correctAnswer: "A",
    topic: "Memory Management",
    difficulty: "Easy",
  },

  {
    id: 30,
    question:
      "Which page replacement algorithm removes the page that has not been used for the longest time?",
    options: ["FIFO", "LRU", "FCFS", "Round Robin"],
    correctAnswer: "B",
    topic: "Memory Management",
    difficulty: "Medium",
  },

  {
    id: 31,
    question: "What is fragmentation?",
    options: [
      "Wasted memory space",
      "CPU scheduling",
      "Process synchronization",
      "Disk formatting",
    ],
    correctAnswer: "A",
    topic: "Memory Management",
    difficulty: "Easy",
  },

  {
    id: 32,
    question:
      "Which type of fragmentation occurs when allocated memory blocks contain unused space?",
    options: [
      "Internal fragmentation",
      "External fragmentation",
      "Logical fragmentation",
      "Virtual fragmentation",
    ],
    correctAnswer: "A",
    topic: "Memory Management",
    difficulty: "Easy",
  },

  {
    id: 33,
    question:
      "Which type of fragmentation occurs between allocated memory blocks?",
    options: [
      "Internal fragmentation",
      "External fragmentation",
      "CPU fragmentation",
      "Page fragmentation",
    ],
    correctAnswer: "B",
    topic: "Memory Management",
    difficulty: "Easy",
  },

  {
    id: 34,
    question: "What is virtual memory?",
    options: [
      "A technique that uses secondary storage to extend apparent main memory",
      "A type of CPU",
      "A type of cache",
      "A scheduling algorithm",
    ],
    correctAnswer: "A",
    topic: "Memory Management",
    difficulty: "Medium",
  },

  {
    id: 35,
    question:
      "Which data structure is commonly used to implement a page table?",
    options: ["Array", "Stack only", "Queue only", "Linked list only"],
    correctAnswer: "A",
    topic: "Memory Management",
    difficulty: "Medium",
  },

  // =========================================================
  // FILE SYSTEMS
  // =========================================================

  {
    id: 36,
    question: "Which component manages files and directories?",
    options: ["File System", "CPU Scheduler", "ALU", "Compiler"],
    correctAnswer: "A",
    topic: "File Systems",
    difficulty: "Easy",
  },

  {
    id: 37,
    question: "Which of the following is a file system?",
    options: ["NTFS", "HTTP", "TCP", "HTML"],
    correctAnswer: "A",
    topic: "File Systems",
    difficulty: "Easy",
  },

  // =========================================================
  // PROCESSES & SYSTEM CALLS
  // =========================================================

  {
    id: 38,
    question: "What is a system call?",
    options: [
      "An interface through which a program requests a service from the OS",
      "A CPU instruction only",
      "A type of process",
      "A type of memory",
    ],
    correctAnswer: "A",
    topic: "Processes & System Calls",
    difficulty: "Medium",
  },

  {
    id: 39,
    question:
      "Which system call is commonly associated with creating a new process in Unix/Linux?",
    options: ["fork()", "printf()", "malloc()", "scanf()"],
    correctAnswer: "A",
    topic: "Processes & System Calls",
    difficulty: "Easy",
  },

  {
    id: 40,
    question: "What is a zombie process?",
    options: [
      "A terminated process whose parent has not yet collected its exit status",
      "A process that is currently running",
      "A process waiting for CPU",
      "A process with no memory",
    ],
    correctAnswer: "A",
    topic: "Processes & System Calls",
    difficulty: "Medium",
  },

  {
    id: 41,
    question: "What is an orphan process?",
    options: [
      "A process whose parent has terminated",
      "A process that has terminated",
      "A process waiting for I/O",
      "A process without memory",
    ],
    correctAnswer: "A",
    topic: "Processes & System Calls",
    difficulty: "Medium",
  },

  {
    id: 42,
    question:
      "Which signal is commonly sent to a parent when a child process terminates?",
    options: ["SIGCHLD", "SIGKILL", "SIGSTOP", "SIGINT"],
    correctAnswer: "A",
    topic: "Processes & System Calls",
    difficulty: "Medium",
  },

  {
    id: 43,
    question:
      "What does the wait() system call generally allow a parent process to do?",
    options: [
      "Wait for a child process to terminate",
      "Create a new thread",
      "Allocate memory",
      "Change CPU frequency",
    ],
    correctAnswer: "A",
    topic: "Processes & System Calls",
    difficulty: "Medium",
  },

  // =========================================================
  // CPU SCHEDULING CONTINUED
  // =========================================================

  {
    id: 44,
    question:
      "Which scheduling algorithm gives each process a fixed time slice?",
    options: ["Round Robin", "FCFS", "SJF", "Banker's Algorithm"],
    correctAnswer: "A",
    topic: "CPU Scheduling",
    difficulty: "Easy",
  },

  {
    id: 45,
    question:
      "Which scheduling metric measures the total time a process spends from arrival to completion?",
    options: ["Turnaround Time", "Waiting Time", "Response Time", "Burst Time"],
    correctAnswer: "A",
    topic: "CPU Scheduling",
    difficulty: "Easy",
  },

  {
    id: 46,
    question:
      "Which scheduling metric measures how long a process waits in the ready queue?",
    options: ["Waiting Time", "Turnaround Time", "Burst Time", "Response Time"],
    correctAnswer: "A",
    topic: "CPU Scheduling",
    difficulty: "Easy",
  },

  {
    id: 47,
    question:
      "Which scheduling metric measures the time from submission until the process first receives CPU time?",
    options: [
      "Response Time",
      "Turnaround Time",
      "Waiting Time",
      "Completion Time",
    ],
    correctAnswer: "A",
    topic: "CPU Scheduling",
    difficulty: "Medium",
  },

  // =========================================================
  // OS INTERFACE
  // =========================================================

  {
    id: 48,
    question:
      "Which of the following is an example of a command-line interface?",
    options: ["Shell", "GUI", "Web browser", "Database"],
    correctAnswer: "A",
    topic: "OS Interface",
    difficulty: "Easy",
  },

  {
    id: 49,
    question: "What is the main purpose of a shell?",
    options: [
      "Provide an interface between the user and the operating system",
      "Manage RAM physically",
      "Execute CPU instructions directly",
      "Store files permanently",
    ],
    correctAnswer: "A",
    topic: "OS Interface",
    difficulty: "Easy",
  },

  {
    id: 50,
    question:
      "Which OS concept allows multiple programs to appear to run simultaneously?",
    options: ["Multitasking", "Paging", "Deadlock", "Fragmentation"],
    correctAnswer: "A",
    topic: "OS Basics",
    difficulty: "Easy",
  },

  // =========================================================
  // ADDITIONAL 50 QUESTIONS
  // =========================================================

  // ---------- OS BASICS ----------

  {
    id: 51,
    question: "Which OS component is responsible for allocating CPU time?",
    options: ["Scheduler", "Compiler", "File System", "Loader"],
    correctAnswer: "A",
    topic: "OS Basics",
    difficulty: "Easy",
  },

  {
    id: 52,
    question:
      "Which mode normally has unrestricted access to system resources?",
    options: ["Kernel mode", "User mode", "Guest mode", "Application mode"],
    correctAnswer: "A",
    topic: "OS Basics",
    difficulty: "Medium",
  },

  {
    id: 53,
    question: "Why does an operating system provide user mode and kernel mode?",
    options: [
      "To protect the system from unrestricted application access",
      "To increase monitor resolution",
      "To replace RAM",
      "To remove system calls",
    ],
    correctAnswer: "A",
    topic: "OS Basics",
    difficulty: "Medium",
  },

  {
    id: 54,
    question:
      "Which component provides the core interface between hardware and software?",
    options: ["Kernel", "Shell", "Browser", "Compiler"],
    correctAnswer: "A",
    topic: "OS Basics",
    difficulty: "Easy",
  },

  {
    id: 55,
    question:
      "A user program needs privileged access to hardware. What does it generally use?",
    options: ["System call", "Text editor", "File extension", "Cache"],
    correctAnswer: "A",
    topic: "OS Basics",
    difficulty: "Medium",
  },

  {
    id: 56,
    question: "Which statement best describes multiprogramming?",
    options: [
      "Keeping multiple programs in memory so CPU utilization can improve",
      "Running only one program at a time",
      "Removing all background processes",
      "Using multiple hard disks",
    ],
    correctAnswer: "A",
    topic: "OS Basics",
    difficulty: "Medium",
  },

  {
    id: 57,
    question:
      "A process requests an operation that requires privileged hardware access. Which path is most appropriate?",
    options: [
      "User program → system call → kernel",
      "User program → compiler → RAM",
      "User program → shell → monitor",
      "User program → browser → disk",
    ],
    correctAnswer: "A",
    topic: "OS Basics",
    difficulty: "Hard",
  },

  // ---------- CPU SCHEDULING ----------

  {
    id: 58,
    question:
      "Three processes arrive at time 0 with burst times 4, 2, and 6. Under FCFS, which process executes first if listed in that order?",
    options: ["P1", "P2", "P3", "All simultaneously"],
    correctAnswer: "A",
    topic: "CPU Scheduling",
    difficulty: "Medium",
  },

  {
    id: 59,
    question: "Which scheduling algorithm can cause the convoy effect?",
    options: ["FCFS", "Round Robin", "SJF", "Priority"],
    correctAnswer: "A",
    topic: "CPU Scheduling",
    difficulty: "Medium",
  },

  {
    id: 60,
    question:
      "Which scheduling algorithm generally gives the minimum average waiting time when burst times are known?",
    options: ["SJF", "FCFS", "Round Robin", "FIFO"],
    correctAnswer: "A",
    topic: "CPU Scheduling",
    difficulty: "Medium",
  },

  {
    id: 61,
    question:
      "What is the main trade-off when the Round Robin time quantum is made extremely small?",
    options: [
      "More context-switch overhead",
      "No process can execute",
      "All processes become deadlocked",
      "Memory usage becomes zero",
    ],
    correctAnswer: "A",
    topic: "CPU Scheduling",
    difficulty: "Medium",
  },

  {
    id: 62,
    question:
      "A process has arrival time 2 and completion time 10. What is its turnaround time?",
    options: ["8", "12", "10", "6"],
    correctAnswer: "A",
    topic: "CPU Scheduling",
    difficulty: "Easy",
  },

  {
    id: 63,
    question:
      "A process arrives at time 0 and first receives CPU at time 7. What is its response time?",
    options: ["7", "0", "14", "Cannot be determined"],
    correctAnswer: "A",
    topic: "CPU Scheduling",
    difficulty: "Medium",
  },

  {
    id: 64,
    question:
      "In preemptive scheduling, what can happen when a higher-priority process arrives?",
    options: [
      "The currently running process may be preempted",
      "The CPU must shut down",
      "All processes terminate",
      "The ready queue is deleted",
    ],
    correctAnswer: "A",
    topic: "CPU Scheduling",
    difficulty: "Easy",
  },

  {
    id: 65,
    question:
      "Which technique can help prevent starvation in priority scheduling?",
    options: ["Aging", "Paging", "Spooling", "Fragmentation"],
    correctAnswer: "A",
    topic: "CPU Scheduling",
    difficulty: "Medium",
  },

  {
    id: 66,
    question:
      "A Round Robin system uses a quantum of 4 ms. A process requires 10 ms of CPU time. Ignoring context-switch overhead, how many CPU bursts does it receive?",
    options: ["3", "2", "4", "10"],
    correctAnswer: "A",
    topic: "CPU Scheduling",
    difficulty: "Hard",
  },

  {
    id: 67,
    question:
      "If the time quantum in Round Robin approaches a very large value, the algorithm behaves similarly to:",
    options: ["FCFS", "SJF", "Priority Scheduling", "SRTF"],
    correctAnswer: "A",
    topic: "CPU Scheduling",
    difficulty: "Hard",
  },

  // ---------- PROCESS SYNCHRONIZATION ----------

  {
    id: 68,
    question: "What is the primary purpose of a semaphore?",
    options: [
      "Control access to shared resources",
      "Allocate disk space",
      "Schedule files",
      "Replace the CPU",
    ],
    correctAnswer: "A",
    topic: "Process Synchronization",
    difficulty: "Easy",
  },

  {
    id: 69,
    question:
      "If two processes simultaneously modify the same shared variable without synchronization, what may occur?",
    options: [
      "Race condition",
      "Page fault",
      "Deadlock only",
      "Context-free execution",
    ],
    correctAnswer: "A",
    topic: "Process Synchronization",
    difficulty: "Easy",
  },

  {
    id: 70,
    question:
      "Which property requires that only one process at a time can execute in a critical section?",
    options: ["Mutual exclusion", "Bounded waiting", "Progress", "Deadlock"],
    correctAnswer: "A",
    topic: "Process Synchronization",
    difficulty: "Easy",
  },

  {
    id: 71,
    question: "What is a race condition?",
    options: [
      "A result that depends on the timing/order of concurrent execution",
      "A process waiting for memory",
      "A CPU scheduling algorithm",
      "A page replacement method",
    ],
    correctAnswer: "A",
    topic: "Process Synchronization",
    difficulty: "Medium",
  },

  {
    id: 72,
    question:
      "Which synchronization problem is commonly illustrated using producers and consumers?",
    options: [
      "Access to a shared bounded buffer",
      "CPU booting",
      "File compression",
      "Page table creation",
    ],
    correctAnswer: "A",
    topic: "Process Synchronization",
    difficulty: "Medium",
  },

  {
    id: 73,
    question:
      "Why is synchronization needed when multiple threads update shared data?",
    options: [
      "To prevent inconsistent results caused by concurrent access",
      "To increase disk capacity",
      "To remove the operating system",
      "To disable scheduling",
    ],
    correctAnswer: "A",
    topic: "Process Synchronization",
    difficulty: "Medium",
  },

  {
    id: 74,
    question:
      "A process enters a critical section while another process is already inside it. Which requirement has been violated?",
    options: [
      "Mutual exclusion",
      "Paging",
      "Turnaround time",
      "Virtual memory",
    ],
    correctAnswer: "A",
    topic: "Process Synchronization",
    difficulty: "Easy",
  },

  // ---------- DEADLOCKS ----------

  {
    id: 75,
    question:
      "Which of the following is one of the four necessary conditions for deadlock?",
    options: [
      "Circular wait",
      "Fast execution",
      "High CPU speed",
      "Large memory",
    ],
    correctAnswer: "A",
    topic: "Deadlocks",
    difficulty: "Easy",
  },

  {
    id: 76,
    question:
      "If a resource can be forcibly taken away from a process, which deadlock condition is weakened?",
    options: [
      "No preemption",
      "Mutual exclusion",
      "Circular wait",
      "Hold and wait",
    ],
    correctAnswer: "A",
    topic: "Deadlocks",
    difficulty: "Medium",
  },

  {
    id: 77,
    question: "What is the main purpose of the Banker's Algorithm?",
    options: [
      "Avoid entering an unsafe state",
      "Minimize page faults",
      "Schedule CPU bursts",
      "Manage files",
    ],
    correctAnswer: "A",
    topic: "Deadlocks",
    difficulty: "Medium",
  },

  {
    id: 78,
    question: "If a system is in a safe state, what does that imply?",
    options: [
      "There exists at least one sequence in which all processes can complete",
      "Deadlock has already occurred",
      "No process can execute",
      "All resources are unused",
    ],
    correctAnswer: "A",
    topic: "Deadlocks",
    difficulty: "Hard",
  },

  {
    id: 79,
    question:
      "Two processes each hold one resource and wait for the resource held by the other. Which condition is directly illustrated?",
    options: [
      "Circular wait",
      "Paging",
      "Starvation only",
      "Internal fragmentation",
    ],
    correctAnswer: "A",
    topic: "Deadlocks",
    difficulty: "Medium",
  },

  {
    id: 80,
    question: "What is the difference between deadlock and starvation?",
    options: [
      "Deadlock involves processes waiting on each other, while starvation involves indefinite postponement",
      "They are exactly the same",
      "Starvation only occurs in memory management",
      "Deadlock only occurs during boot",
    ],
    correctAnswer: "A",
    topic: "Deadlocks",
    difficulty: "Hard",
  },

  // ---------- MEMORY MANAGEMENT ----------

  {
    id: 81,
    question:
      "In paging, logical memory is divided into pages while physical memory is divided into:",
    options: ["Frames", "Segments", "Processes", "Blocks only"],
    correctAnswer: "A",
    topic: "Memory Management",
    difficulty: "Easy",
  },

  {
    id: 82,
    question:
      "If page size is 4 KB, what is the size of each frame in a basic paging system?",
    options: ["4 KB", "8 KB", "2 KB", "16 KB"],
    correctAnswer: "A",
    topic: "Memory Management",
    difficulty: "Easy",
  },

  {
    id: 83,
    question:
      "What happens when a process references a page that is not currently in RAM?",
    options: [
      "A page fault occurs",
      "A context switch is impossible",
      "The file system shuts down",
      "The CPU stops permanently",
    ],
    correctAnswer: "A",
    topic: "Memory Management",
    difficulty: "Easy",
  },

  {
    id: 84,
    question:
      "Which page replacement algorithm replaces the page that has been in memory the longest?",
    options: ["FIFO", "LRU", "SJF", "Round Robin"],
    correctAnswer: "A",
    topic: "Memory Management",
    difficulty: "Medium",
  },

  {
    id: 85,
    question: "Which page replacement algorithm uses recent usage information?",
    options: ["LRU", "FCFS", "FIFO", "Priority Scheduling"],
    correctAnswer: "A",
    topic: "Memory Management",
    difficulty: "Easy",
  },

  {
    id: 86,
    question:
      "A process has 8 pages and each page is 4 KB. What is the total logical memory represented by these pages?",
    options: ["32 KB", "12 KB", "16 KB", "64 KB"],
    correctAnswer: "A",
    topic: "Memory Management",
    difficulty: "Medium",
  },

  {
    id: 87,
    question:
      "Which problem occurs when memory is divided into allocated blocks with unused space inside those blocks?",
    options: [
      "Internal fragmentation",
      "External fragmentation",
      "Deadlock",
      "Starvation",
    ],
    correctAnswer: "A",
    topic: "Memory Management",
    difficulty: "Easy",
  },

  {
    id: 88,
    question:
      "Why can virtual memory allow programs larger than physical RAM to execute?",
    options: [
      "Only required portions need to be kept in physical memory at a time",
      "RAM becomes physically larger",
      "The CPU stops using memory",
      "Files are converted into CPU registers",
    ],
    correctAnswer: "A",
    topic: "Memory Management",
    difficulty: "Medium",
  },

  {
    id: 89,
    question:
      "A system has 16-bit logical addresses and a page size of 1 KB. How many bits are required for the page offset?",
    options: ["10", "6", "8", "16"],
    correctAnswer: "A",
    topic: "Memory Management",
    difficulty: "Hard",
  },

  {
    id: 90,
    question:
      "A 32-bit logical address uses 4 KB pages. How many bits identify the page offset?",
    options: ["12", "10", "16", "20"],
    correctAnswer: "A",
    topic: "Memory Management",
    difficulty: "Hard",
  },

  // ---------- FILE SYSTEMS ----------

  {
    id: 91,
    question: "What is the main purpose of a directory in a file system?",
    options: [
      "Organize and reference files",
      "Schedule CPU processes",
      "Replace RAM",
      "Prevent context switches",
    ],
    correctAnswer: "A",
    topic: "File Systems",
    difficulty: "Easy",
  },

  {
    id: 92,
    question:
      "Which of the following is associated with file system organization?",
    options: ["Directories", "CPU bursts", "Semaphores", "Page faults"],
    correctAnswer: "A",
    topic: "File Systems",
    difficulty: "Easy",
  },

  {
    id: 93,
    question: "What information can a file system maintain about a file?",
    options: [
      "Name, size, permissions and location-related metadata",
      "Only CPU temperature",
      "Only process priority",
      "Only page number",
    ],
    correctAnswer: "A",
    topic: "File Systems",
    difficulty: "Medium",
  },

  {
    id: 94,
    question: "Why are file permissions useful in an operating system?",
    options: [
      "They control which users or processes can access files",
      "They increase CPU clock speed",
      "They remove the need for memory",
      "They schedule threads",
    ],
    correctAnswer: "A",
    topic: "File Systems",
    difficulty: "Medium",
  },

  // ---------- PROCESSES & SYSTEM CALLS ----------

  {
    id: 95,
    question:
      "What is the usual relationship between fork() and the processes after a successful call?",
    options: [
      "A new child process is created",
      "The parent process is deleted",
      "All processes terminate",
      "The CPU is disabled",
    ],
    correctAnswer: "A",
    topic: "Processes & System Calls",
    difficulty: "Medium",
  },

  {
    id: 96,
    question:
      "A child process terminates before its parent calls wait(). What state can the child temporarily enter?",
    options: ["Zombie", "Orphan", "Ready", "Running"],
    correctAnswer: "A",
    topic: "Processes & System Calls",
    difficulty: "Medium",
  },

  {
    id: 97,
    question:
      "A parent process terminates while its child continues executing. What is the child commonly called?",
    options: ["Orphan", "Zombie", "Daemon only", "Deadlock"],
    correctAnswer: "A",
    topic: "Processes & System Calls",
    difficulty: "Easy",
  },

  {
    id: 98,
    question: "Why is wait() important after a child process terminates?",
    options: [
      "It allows the parent to collect the child's termination status",
      "It creates physical memory",
      "It starts the CPU",
      "It prevents all context switches",
    ],
    correctAnswer: "A",
    topic: "Processes & System Calls",
    difficulty: "Medium",
  },

  // ---------- OS INTERFACE ----------

  {
    id: 99,
    question:
      "Which layer generally interprets commands typed by a user in a command-line environment?",
    options: ["Shell", "Kernel only", "RAM", "CPU cache"],
    correctAnswer: "A",
    topic: "OS Interface",
    difficulty: "Easy",
  },

  {
    id: 100,
    question:
      "A shell command needs an operating system service such as creating a process. What mechanism ultimately allows the application environment to request that service?",
    options: [
      "System call",
      "Page replacement",
      "Fragmentation",
      "Round Robin",
    ],
    correctAnswer: "A",
    topic: "OS Interface",
    difficulty: "Hard",
  },
];
