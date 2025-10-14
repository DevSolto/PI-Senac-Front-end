import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckSquare, Clock, User, Plus } from 'lucide-react';

const tasks = [
  { id: 1, title: 'Irrigate Field F001', priority: 'High', status: 'In Progress', assignee: 'Mike Johnson', due: '2024-08-09' },
  { id: 2, title: 'Spray pesticide on F003', priority: 'Critical', status: 'Pending', assignee: 'Sarah Wilson', due: '2024-08-08' },
  { id: 3, title: 'Harvest soybeans F002', priority: 'Medium', status: 'Scheduled', assignee: 'Tom Anderson', due: '2024-08-15' },
  { id: 4, title: 'Soil test F004', priority: 'Low', status: 'Completed', assignee: 'Lisa Brown', due: '2024-08-07' },
];

export function TaskManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Task Management</h1>
          <p className="text-muted-foreground">Organize and track field operations and maintenance tasks</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckSquare className="w-5 h-5 text-agro-green" />
              <span>Completed</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-agro-orange" />
              <span>In Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-agro-yellow" />
              <span>Pending</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5 text-agro-blue" />
              <span>Overdue</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-agro-red">2</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasks.map(task => (
              <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{task.title}</h3>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                    <span>Assigned to: {task.assignee}</span>
                    <span>Due: {task.due}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={
                    task.priority === 'Critical' ? 'destructive' :
                    task.priority === 'High' ? 'secondary' : 'outline'
                  }>
                    {task.priority}
                  </Badge>
                  <Badge variant={
                    task.status === 'Completed' ? 'default' :
                    task.status === 'In Progress' ? 'secondary' : 'outline'
                  }>
                    {task.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}