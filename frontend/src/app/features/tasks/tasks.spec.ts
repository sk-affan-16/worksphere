import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { Auth } from '../../core/auth/auth';
import { AuthApiService } from '../../core/auth/auth-api.service';
import { Tasks } from './tasks';
import { TaskResponse, TasksApiService } from './tasks-api.service';

const sampleTask: TaskResponse = {
  id: 7,
  title: 'Prepare workstation',
  assigneeEmployeeId: 3,
  assigneeName: 'Maya Sen',
  assigneeEmail: 'maya@worksphere.local',
  department: 'IT',
  dueDate: '2026-12-20',
  priority: 'HIGH',
  status: 'TO_DO',
  createdAt: '2026-11-01T10:00:00Z',
  updatedAt: '2026-11-01T10:00:00Z',
};

describe('Tasks', () => {
  let component: Tasks;
  let fixture: ComponentFixture<Tasks>;

  let api: {
    getOrganizationTasks: ReturnType<typeof vi.fn>;
    getMyTasks: ReturnType<typeof vi.fn>;
    createTask: ReturnType<typeof vi.fn>;
    updateTaskStatus: ReturnType<typeof vi.fn>;
  };

  let auth: {
    role: ReturnType<typeof vi.fn>;
    setCurrentUser: ReturnType<typeof vi.fn>;
  };

  let authApi: {
    getCurrentUser: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    api = {
      getOrganizationTasks: vi.fn().mockReturnValue(of([sampleTask])),
      getMyTasks: vi.fn().mockReturnValue(of([sampleTask])),
      createTask: vi.fn().mockReturnValue(
        of({
          ...sampleTask,
          id: 8,
        }),
      ),
      updateTaskStatus: vi.fn().mockReturnValue(
        of({
          ...sampleTask,
          status: 'COMPLETED',
        }),
      ),
    };

    auth = {
      role: vi.fn().mockReturnValue('ORG_ADMIN'),
      setCurrentUser: vi.fn(),
    };

    authApi = {
      getCurrentUser: vi.fn().mockReturnValue(
        of({
          userId: 1,
          organizationId: 1,
          email: 'admin@worksphere.local',
          role: 'ORG_ADMIN',
        }),
      ),
    };

    await TestBed.configureTestingModule({
      imports: [Tasks],
      providers: [
        {
          provide: TasksApiService,
          useValue: api,
        },
        {
          provide: Auth,
          useValue: auth,
        },
        {
          provide: AuthApiService,
          useValue: authApi,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Tasks);
    component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create and load organization tasks for an admin', () => {
    expect(component).toBeTruthy();
    expect(api.getOrganizationTasks).toHaveBeenCalledOnce();
    expect(component.tasks()).toEqual([sampleTask]);
  });

  it('should load only the current employee tasks for an employee role', async () => {
    // Clear calls made by the initial admin component.
    api.getOrganizationTasks.mockClear();
    api.getMyTasks.mockClear();

    // Destroy the admin component before changing the role.
    fixture.destroy();

    // Set the employee role before creating the new component.
    auth.role.mockReturnValue('EMPLOYEE');

    fixture = TestBed.createComponent(Tasks);
    component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();

    expect(api.getMyTasks).toHaveBeenCalledOnce();
    expect(api.getOrganizationTasks).not.toHaveBeenCalled();
    expect(component.tasks()).toEqual([sampleTask]);
  });

  it('should render API task records and accessible table headers', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelectorAll('tbody tr').length).toBe(1);
    expect(compiled.textContent).toContain('Maya Sen');
    expect(compiled.textContent).toContain('maya@worksphere.local');

    expect(
      compiled.querySelector('table')?.getAttribute('aria-labelledby'),
    ).toBe('task-tracker-title');

    expect(compiled.querySelectorAll('thead th').length).toBe(6);
  });

  it('should filter tasks by assignee and priority', () => {
    component.updateSearch('maya@worksphere.local');

    expect(component.filteredTasks().length).toBe(1);

    component.updatePriority('LOW');

    expect(component.filteredTasks().length).toBe(0);
  });

  it('should show empty state when no tasks match', () => {
    component.updateSearch('does-not-exist');

    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('app-empty-state'),
    ).toBeTruthy();
  });

  it('should open the create form for admins and use backend request fields', () => {
    component.openCreateTask();

    component.createTaskForm.setValue({
      title: '  Prepare access credentials  ',
      assigneeEmail: '  Maya@WorkSphere.local ',
      dueDate: '2026-12-20',
      priority: 'HIGH',
    });

    component.saveTask();

    expect(api.createTask).toHaveBeenCalledOnce();

    expect(api.createTask).toHaveBeenCalledWith({
      title: 'Prepare access credentials',
      assigneeEmail: 'maya@worksphere.local',
      dueDate: '2026-12-20',
      priority: 'HIGH',
    });

    expect(component.isCreateTaskOpen()).toBe(false);
    expect(component.tasks().length).toBe(2);
  });

  it('should not submit an invalid create form', () => {
    component.openCreateTask();

    component.saveTask();

    expect(component.createTaskForm.invalid).toBe(true);
    expect(component.createTaskSubmitted()).toBe(true);
    expect(api.createTask).not.toHaveBeenCalled();
  });

  it('should show a useful error when create fails', () => {
    api.createTask.mockReturnValue(
      throwError(() => ({
        status: 404,
        error: {
          message: 'Employee not found',
        },
      })),
    );

    component.openCreateTask();

    component.createTaskForm.setValue({
      title: 'Prepare access credentials',
      assigneeEmail: 'unknown@worksphere.local',
      dueDate: '2026-12-20',
      priority: 'HIGH',
    });

    component.saveTask();

    expect(component.errorMessage()).toBe(
      'Unable to create the task. Please check the assignee email and try again.',
    );

    expect(component.isSaving()).toBe(false);
  });

  it('should send status updates to the API and replace the returned task', () => {
    const updated: TaskResponse = {
      ...sampleTask,
      status: 'COMPLETED',
    };

    api.updateTaskStatus.mockReturnValue(of(updated));

    component.updateTaskStatus(sampleTask, 'COMPLETED');

    expect(api.updateTaskStatus).toHaveBeenCalledWith(7, {
      status: 'COMPLETED',
    });

    expect(component.tasks()[0].status).toBe('COMPLETED');
  });

  it('should show a load error and clear loading state', () => {
    api.getOrganizationTasks.mockReturnValue(
      throwError(() => new Error('network')),
    );

    component.loadTasks();

    expect(component.isLoading()).toBe(false);
    expect(component.errorMessage()).toContain('Unable to load tasks');
  });

  it('should reset the create form when cancelled', () => {
    component.openCreateTask();

    component.createTaskForm.patchValue({
      title: 'Temporary task',
    });

    component.closeCreateTask();

    expect(component.isCreateTaskOpen()).toBe(false);

    expect(component.createTaskForm.getRawValue()).toEqual({
      title: '',
      assigneeEmail: '',
      dueDate: '',
      priority: 'MEDIUM',
    });
  });
});
