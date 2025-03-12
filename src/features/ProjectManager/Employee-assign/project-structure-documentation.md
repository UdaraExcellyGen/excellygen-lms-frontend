# Employee Assignment System Project Structure

This document outlines the component structure of the Employee Assignment System, showing how the codebase is organized into separate files for better maintainability and organization.

## Project Directory Structure

```
src/
└── features/
    └── ProjectManager/
        └── Employee-assign/
            ├── Employee-assign.tsx         # Main container component
            ├── components/                 # UI components
            │   ├── MultiSelect.tsx         # Technology selection dropdown
            │   ├── ProjectCard.tsx         # Project display card
            │   ├── EmployeeCard.tsx        # Employee display card
            │   ├── ProjectDetailsPopup.tsx # Project details modal
            │   ├── ConfirmationDialog.tsx  # Assignment confirmation modal
            │   ├── BottomBarWithAvatars.tsx # Bottom selection bar
            │   ├── DuplicateAssignmentDialog.tsx # Duplicate warning
            │   └── RemoveEmployeeConfirmationDialog.tsx # Removal confirmation
            ├── data/                       # Data resources
            │   └── mockData.ts             # Sample data for development
            └── types/                      # TypeScript type definitions
                └── types.ts                # Shared interface definitions
```

## Component Overview

### Main Container Component

#### `Employee-assign.tsx`
- The main container component that orchestrates the entire application
- Manages the core state of the application
- Contains the primary business logic
- Imports and arranges all sub-components

### UI Components

#### `MultiSelect.tsx`
```typescript
interface MultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: string[];
  darkMode: boolean;
  buttonRef: React.RefObject<HTMLButtonElement>;
}
```
- A reusable dropdown component for selecting multiple technologies
- Uses the createPortal API for proper dropdown positioning

#### `ProjectCard.tsx`
```typescript
interface ProjectCardProps {
  project: Project;
  isSelected: boolean;
  isExpanded: boolean;
  employees: Employee[];
  handleProjectSelect: (project: Project) => void;
  toggleProjectExpansion: (projectId: number) => void;
  triggerRemoveConfirmation: (projectId: number, employeeId: number, employeeName: string, projectName: string) => void;
}
```
- Displays project information in a card
- Handles expansion to show more details
- Shows workload distribution visualization
- Displays team members with their roles and allocations

#### `EmployeeCard.tsx`
```typescript
interface EmployeeCardProps {
  employee: Employee;
  isSelected: boolean;
  projects: Project[];
  handleEmployeeSelect: (id: number) => void;
  handleOpenProjectDetails: (project: Project) => void;
  calculateWorkload: (employeeId: number) => number;
  isDisabled?: boolean;
}
```
- Displays employee information in a card
- Shows workload status and availability
- Lists employee's skills, certifications, and assigned projects
- Becomes disabled when no project is selected

#### `ProjectDetailsPopup.tsx`
```typescript
interface ProjectDetailsPopupProps {
  project: Project | null;
  onClose: () => void;
  darkMode: boolean;
  employees: Employee[];
}
```
- Modal displaying detailed project information
- Lists all project information including team members and their roles

#### `ConfirmationDialog.tsx`
```typescript
interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (employeeAssignments: Record<number, { role: string, workloadPercentage: number }>) => void;
  selectedEmployees: number[];
  selectedProject: Project | null;
  employees: Employee[];
  projectRoles: string[];
  assignmentError: string;
  getEmployeeAvailableWorkload: (employeeId: number) => number;
  calculateEmployeeCurrentWorkload: (employeeId: number) => number;
}
```
- Modal for confirming employee assignments to projects
- Allows role selection and workload percentage allocation
- Validates assignments to prevent overallocation

#### `BottomBarWithAvatars.tsx`
```typescript
interface BottomBarWithAvatarsProps {
  selectedEmployees: number[];
  selectedProject: Project | null;
  employees: Employee[];
  handleAssignEmployees: () => void;
  clearSelections: () => void;
}
```
- Fixed bottom bar showing selection status
- Displays avatars of selected employees
- Provides action buttons for assignment or clearing selections

#### `DuplicateAssignmentDialog.tsx`
```typescript
interface DuplicateAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  duplicateEmployees: Employee[];
  selectedProject: Project | null;
}
```
- Warning dialog shown when attempting to assign employees to roles they already have

#### `RemoveEmployeeConfirmationDialog.tsx`
```typescript
interface RemoveEmployeeConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  employeeName: string | undefined;
  projectName: string | undefined;
}
```
- Confirmation dialog shown when removing an employee from a project

### Data Management

#### `mockData.ts`
- Contains sample data for projects, employees, and other app resources
- Exports constants used throughout the application
- Includes technology skills list and project roles

### Type Definitions

#### `types.ts`
```typescript
export interface Employee {
  id: number;
  name: string;
  role: string;
  skills: string[];
  status: string;
  completedProjects: number;
  activeProjects: string[];
  coursesCompleted: string[];
}

export interface RoleItem {
  role: string;
  count: number;
}

export interface EmployeeAssignment {
  employeeId: number;
  role: string;
  workloadPercentage: number;
}

export interface Project {
  id: number;
  name: string;
  status: string;
  deadline: string;
  description: string;
  shortDescription: string;
  requiredSkills: string[];
  assignedEmployees: EmployeeAssignment[];
  requiredRoles: RoleItem[];
  initialRequiredRoles: RoleItem[];
}

export interface CourseSkillMap {
  [courseName: string]: string[];
}
```
- Shared interfaces used across the application
- Defines the structure of core entities

## Key Features Implemented

1. **Project Selection**:
   - Projects are displayed with headers identifying selected status
   - Selected projects have expanded information available

2. **Employee Selection**:
   - Employees can only be selected after a project is selected
   - Warning messages prevent incorrect selection order
   - Visual indicators show which employees are selected

3. **Workload Management**:
   - Tracks employee workload across multiple projects
   - Prevents assigning employees beyond 100% capacity
   - Shows visual workload distribution with progress bars
   - Allows custom allocation percentages per role

4. **Multi-role Support**:
   - Employees can be assigned to multiple roles within the same project
   - Total workload is calculated across all roles and projects
   - Grouped visualization of workload by employee

5. **Filtering and Search**:
   - Project filtering by status and search terms
   - Employee filtering by skills, availability and search terms
   - Technology matching to find employees with specific skills

## How to Modify the Code

### Adding New Features

1. Determine which component should contain the new feature
2. Update the relevant component file
3. If the feature requires new data, update the types.ts file first
4. For shared functionality, update the main Employee-assign.tsx file

### Fixing Bugs

1. Identify the component where the bug is occurring
2. Check the component's props and state to ensure correct data flow
3. Verify that types are being properly enforced
4. Test the fix in context with related components

### Styling Changes

1. Each component contains its own styling using Tailwind CSS classes
2. For major style changes, consider updating multiple components for consistency
3. The project uses a purple/violet color scheme with consistent token values

## Common Tasks

### Adding a New Field to Employees

1. Update the `Employee` interface in `types.ts`
2. Update the `EmployeeCard` component to display the new field
3. Modify `Employee-assign.tsx` if the field requires additional data processing

### Adding a New Field to Projects

1. Update the `Project` interface in `types.ts`
2. Update the `ProjectCard` component to display the new field
3. Update any other components that might display this data (like `ProjectDetailsPopup`)

### Changing the Assignment Logic

1. Update the `confirmAssignment` function in `Employee-assign.tsx`
2. If the UI for assignment changes, update the `ConfirmationDialog` component
3. Update the state and types accordingly

### Modifying the Selection Style

1. Update the selected state styling in the card components:
   - `ProjectCard.tsx` for project selection style
   - `EmployeeCard.tsx` for employee selection style
