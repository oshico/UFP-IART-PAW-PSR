package handlers

import (
	"crypto/rand"
	"fmt"
	"sync"
	"time"
)

type TaskStatus string

const (
	TaskStatusPending    TaskStatus = "pending"
	TaskStatusProcessing TaskStatus = "processing"
	TaskStatusDone       TaskStatus = "done"
	TaskStatusError      TaskStatus = "error"
)

type ImportTask struct {
	ID        string     `json:"id"`
	Status    TaskStatus `json:"status"`
	Imported  int        `json:"imported"`
	Errors    int        `json:"errors"`
	ErrorMsg  string     `json:"error,omitempty"`
	CreatedAt time.Time  `json:"created_at"`
}

type TaskStore struct {
	mu    sync.Mutex
	tasks map[string]*ImportTask
}

var GlobalTaskStore = &TaskStore{
	tasks: make(map[string]*ImportTask),
}

func newTaskID() string {
	b := make([]byte, 16)
	rand.Read(b)
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:])
}

func (ts *TaskStore) CreateTask() *ImportTask {
	ts.mu.Lock()
	defer ts.mu.Unlock()

	id := newTaskID()
	task := &ImportTask{
		ID:        id,
		Status:    TaskStatusPending,
		CreatedAt: time.Now(),
	}
	ts.tasks[id] = task
	return task
}

func (ts *TaskStore) GetTask(id string) (*ImportTask, bool) {
	ts.mu.Lock()
	defer ts.mu.Unlock()
	task, ok := ts.tasks[id]
	return task, ok
}

func (ts *TaskStore) UpdateTask(id string, fn func(*ImportTask)) {
	ts.mu.Lock()
	defer ts.mu.Unlock()
	if task, ok := ts.tasks[id]; ok {
		fn(task)
	}
}
