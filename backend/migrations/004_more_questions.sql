-- Run once in Supabase Dashboard -> SQL Editor (after 003).
-- Adds 38 questions so every topic has at least 8 Easy, 8 Medium
-- and 8 Hard questions. Safe to run again: existing questions are skipped.

insert into public.questions (question, options, correct_index, topic, difficulty)
values
  ('P1, P2 and P3 arrive at time 0 in that order with burst times 4, 3 and 2 ms. Under FCFS, what is the average turnaround time?', array['3.67 ms', '6.67 ms', '9 ms', '5 ms'], 1, 'CPU Scheduling', 'Hard'),
  ('P1 (burst 7 ms) and P2 (burst 4 ms) arrive at time 0 in that order. Using Round Robin with a 3 ms quantum, when does P1 complete?', array['10 ms', '9 ms', '11 ms', '7 ms'], 2, 'CPU Scheduling', 'Hard'),
  ('In deadlock terms, what does the mutual exclusion condition mean?', array['At least one resource can be used by only one process at a time', 'Processes must take turns using the CPU', 'Every process must exclude other processes from memory', 'Two processes can never run at the same time'], 0, 'Deadlocks', 'Easy'),
  ('Which is a common way for an operating system to recover from a detected deadlock?', array['Restarting the computer every hour', 'Terminating one or more of the deadlocked processes', 'Adding more RAM', 'Increasing the time quantum'], 1, 'Deadlocks', 'Easy'),
  ('Which everyday situation best shows a deadlock?', array['A long queue at a single checkout', 'Four cars at a four-way stop, each waiting for another car to go first', 'A car running out of fuel', 'Two people taking turns using one printer'], 1, 'Deadlocks', 'Easy'),
  ('What is the difference between deadlock prevention and deadlock avoidance?', array['Prevention makes one of the four conditions impossible; avoidance checks each request to stay in a safe state', 'Prevention happens after a deadlock; avoidance happens before', 'Avoidance removes mutual exclusion; prevention uses the Banker''s Algorithm', 'There is no difference'], 0, 'Deadlocks', 'Medium'),
  ('What must each process tell the Banker''s Algorithm in advance?', array['Its total running time', 'The maximum number of each resource it may need', 'Its priority', 'Which other processes it will talk to'], 1, 'Deadlocks', 'Medium'),
  ('A system has 5 instances of one resource shared by 4 processes, and each process needs at most 2 instances. Can deadlock occur?', array['No, 5 instances are enough to guarantee every process can finish', 'Yes, at least 8 instances are needed', 'Yes, deadlock is always possible with 4 processes', 'Only if the processes run on different CPUs'], 0, 'Deadlocks', 'Hard'),
  ('One resource type has 2 instances available. P1 holds 1 and needs 3 more, P2 holds 2 and needs 1 more, P3 holds 1 and needs 4 more. Which of these is a safe sequence?', array['P1, P2, P3', 'P2, P1, P3', 'P3, P2, P1', 'No safe sequence exists'], 1, 'Deadlocks', 'Hard'),
  ('What is the root directory?', array['The top-level directory that contains all other directories', 'The directory where deleted files go', 'A directory only the CPU can read', 'The most recently opened directory'], 0, 'File Systems', 'Easy'),
  ('What does formatting a disk partition do?', array['Defragments the existing files', 'Creates a new, empty file system on it', 'Makes the partition read-only', 'Copies all files to the cloud'], 1, 'File Systems', 'Easy'),
  ('What does a File Allocation Table (FAT) record?', array['Which block comes next for each file', 'The password for each file', 'Which process is using the CPU', 'The size of RAM'], 0, 'File Systems', 'Medium'),
  ('A disk has 1,000,000 blocks and free space is tracked with a bitmap using one bit per block. How large is the bitmap?', array['1,000,000 bytes', '125,000 bytes', '8,000,000 bytes', '12,500 bytes'], 1, 'File Systems', 'Hard'),
  ('A Unix inode has 12 direct block pointers and the block size is 4 KB. How much file data can be reached using only the direct pointers?', array['12 KB', '4 KB', '48 KB', '4 MB'], 2, 'File Systems', 'Hard'),
  ('Using Optimal page replacement with 3 frames (initially empty), how many page faults occur for the reference string 1, 2, 3, 4, 1, 2, 5, 1, 2, 3?', array['5', '6', '7', '8'], 1, 'Memory Management', 'Hard'),
  ('With 4 KB (4096-byte) pages, which page and offset does logical address 8200 map to?', array['Page 8, offset 2', 'Page 2, offset 8', 'Page 2, offset 4104', 'Page 1, offset 4104'], 1, 'Memory Management', 'Hard'),
  ('What is an interrupt?', array['A signal that makes the CPU pause its current work to handle an event', 'A program that has crashed', 'A type of file permission', 'A slow memory access'], 0, 'OS Basics', 'Medium'),
  ('What does the bootloader do when a computer starts?', array['Loads the operating system kernel into memory and starts it', 'Checks emails', 'Formats the hard disk', 'Closes all running programs'], 0, 'OS Basics', 'Medium'),
  ('What is the difference between an interrupt and a trap (exception)?', array['An interrupt comes from hardware outside the running program; a trap is caused by the running program itself', 'A trap comes from hardware; an interrupt comes from the program', 'Interrupts only happen at startup', 'There is no difference'], 0, 'OS Basics', 'Hard'),
  ('What is the mode bit in the CPU used for?', array['Recording whether the CPU is currently in user mode or kernel mode', 'Choosing between 32-bit and 64-bit programs', 'Turning the screen on and off', 'Selecting the next process to run'], 0, 'OS Basics', 'Hard'),
  ('What is DMA (Direct Memory Access) used for?', array['Letting devices transfer data to memory without the CPU copying every byte', 'Giving user programs direct access to the kernel', 'Encrypting memory', 'Swapping pages to disk'], 0, 'OS Basics', 'Hard'),
  ('In a Linux shell, which command creates a new directory?', array['mkdir', 'rm', 'ls', 'touch'], 0, 'OS Interface', 'Easy'),
  ('In a Linux shell, which command changes the current directory?', array['pwd', 'cd', 'mv', 'cat'], 1, 'OS Interface', 'Easy'),
  ('In the shell command echo hi >> notes.txt, what does >> do?', array['Replaces the contents of notes.txt', 'Adds the output to the end of notes.txt', 'Reads input from notes.txt', 'Deletes notes.txt'], 1, 'OS Interface', 'Medium'),
  ('What does the command chmod +x script.sh do?', array['Deletes the script', 'Gives the file permission to be executed', 'Makes the file hidden', 'Copies the script'], 1, 'OS Interface', 'Medium'),
  ('Which key combination usually stops a program that is running in the terminal?', array['Ctrl + Z', 'Ctrl + S', 'Ctrl + C', 'Ctrl + V'], 2, 'OS Interface', 'Medium'),
  ('For the shell command cat file.txt | sort | uniq, how many processes does the shell normally start?', array['1', '2', '3', '4'], 2, 'OS Interface', 'Hard'),
  ('In a Unix shell, what does a command''s exit status (shown by echo $?) tell you?', array['How long the command ran', 'Whether the last command succeeded (0) or failed (non-zero)', 'The command''s process ID', 'How much memory the command used'], 1, 'OS Interface', 'Hard'),
  ('What is the difference between running ./script.sh and source script.sh?', array['./script.sh runs in a new child process; source runs the commands in the current shell', 'source runs the script in the background', './script.sh needs administrator rights', 'There is no difference'], 0, 'OS Interface', 'Hard'),
  ('What is a mutex lock?', array['A lock that only the thread holding it can release, used to protect a critical section', 'A counter that tracks free memory', 'A type of CPU scheduler', 'A file that stores shared data'], 0, 'Process Synchronization', 'Medium'),
  ('What does the signal() operation on a semaphore do?', array['Increments the semaphore and may wake a waiting process', 'Decrements the semaphore and may block the caller', 'Deletes the semaphore', 'Sends a message to another computer'], 0, 'Process Synchronization', 'Medium'),
  ('What is priority inversion?', array['A high-priority task waits for a lock held by a low-priority task, which is itself delayed by medium-priority tasks', 'The scheduler always runs the lowest-priority task first', 'Two tasks swap priorities every time slice', 'A task''s priority is reset when it finishes'], 0, 'Process Synchronization', 'Hard'),
  ('In the readers-writers problem, what can happen if readers are always given priority?', array['Readers may starve', 'Writers may starve', 'Data is always corrupted', 'Only one reader can read at a time'], 1, 'Process Synchronization', 'Hard'),
  ('What does the exit() system call do?', array['Creates a new process', 'Terminates the calling process', 'Pauses the process for one second', 'Opens a file'], 1, 'Processes & System Calls', 'Easy'),
  ('Which number uniquely identifies a running process?', array['Process ID (PID)', 'Page number', 'Port number', 'Block number'], 0, 'Processes & System Calls', 'Easy'),
  ('A program calls fork() once and then prints hello. If fork() succeeds, how many times is hello printed?', array['1', '2', '3', '4'], 1, 'Processes & System Calls', 'Hard'),
  ('What does copy-on-write mean after fork()?', array['Parent and child share memory pages until one of them writes, and only then is that page copied', 'The child''s memory is copied to disk', 'The parent cannot write until the child exits', 'All memory is copied immediately when fork() is called'], 0, 'Processes & System Calls', 'Hard'),
  ('A process in the Waiting state finishes its I/O. Which state does it move to next?', array['Running', 'Ready', 'Terminated', 'New'], 1, 'Processes & System Calls', 'Hard')
on conflict (question) do nothing;

notify pgrst, 'reload schema';

-- Check: questions per topic and difficulty
select topic, difficulty, count(*) as questions
from public.questions
group by topic, difficulty
order by topic, difficulty;
