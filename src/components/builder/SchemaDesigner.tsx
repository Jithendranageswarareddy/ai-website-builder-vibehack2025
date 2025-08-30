import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Database, Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface DatabaseField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  unique: boolean;
  defaultValue?: string;
}

export interface DatabaseTable {
  id: string;
  name: string;
  fields: DatabaseField[];
}

export interface DatabaseRelation {
  id: string;
  fromTable: string;
  toTable: string;
  type: 'oneToOne' | 'oneToMany' | 'manyToMany';
  fromField: string;
  toField: string;
}

const fieldTypes = [
  'String', 'Int', 'Float', 'Boolean', 'DateTime', 'Json'
];

export interface SchemaDesignerProps {
  tables: DatabaseTable[];
  setTables: (tables: DatabaseTable[]) => void;
}

export const SchemaDesigner = ({ tables, setTables }: SchemaDesignerProps) => {
  const [relations, setRelations] = useState<DatabaseRelation[]>([]);
  const [newTableName, setNewTableName] = useState("");
  const { toast } = useToast();

  const addTable = () => {
    if (!newTableName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a table name",
        variant: "destructive"
      });
      return;
    }

    const newTable: DatabaseTable = {
      id: `table-${Date.now()}`,
      name: newTableName,
      fields: [
        {
          id: `field-${Date.now()}`,
          name: 'id',
          type: 'Int',
          required: true,
          unique: true
        }
      ]
    };

    const updatedTables = [...tables, newTable];
    setTables(updatedTables);
    setNewTableName("");
    
    toast({
      title: "Table Created",
      description: `Table "${newTableName}" has been created`
    });
  };

  const removeTable = (tableId: string) => {
    const updatedTables = tables.filter(t => t.id !== tableId);
    const updatedRelations = relations.filter(r => 
      r.fromTable !== tableId && r.toTable !== tableId
    );
    
    setTables(updatedTables);
    setRelations(updatedRelations);
    setTables(updatedTables);
    setRelations(updatedRelations);
  };

  const addField = (tableId: string) => {
    const updatedTables = tables.map(table => {
      if (table.id === tableId) {
        return {
          ...table,
          fields: [...table.fields, {
            id: `field-${Date.now()}`,
            name: 'newField',
            type: 'String',
            required: false,
            unique: false
          }]
        };
      }
      return table;
    });
    
    setTables(updatedTables);
  };

  const updateField = (tableId: string, fieldId: string, updates: Partial<DatabaseField>) => {
    const updatedTables = tables.map(table => {
      if (table.id === tableId) {
        return {
          ...table,
          fields: table.fields.map(field => 
            field.id === fieldId ? { ...field, ...updates } : field
          )
        };
      }
      return table;
    });
    
    setTables(updatedTables);
  };

  const removeField = (tableId: string, fieldId: string) => {
    const updatedTables = tables.map(table => {
      if (table.id === tableId) {
        return {
          ...table,
          fields: table.fields.filter(field => field.id !== fieldId)
        };
      }
      return table;
    });
    
    setTables(updatedTables);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Database className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Database Schema Designer</h2>
      </div>

      {/* Add New Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add New Table
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Table name (e.g., User, Post, Product)"
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTable()}
            />
            <Button onClick={addTable}>
              <Plus className="w-4 h-4 mr-2" />
              Add Table
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {tables.map(table => (
          <Card key={table.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{table.name}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTable(table.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {table.fields.map(field => (
                <div key={field.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Input
                      value={field.name}
                      onChange={(e) => updateField(table.id, field.id, { name: e.target.value })}
                      className="font-mono text-sm"
                    />
                    {field.name !== 'id' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeField(table.id, field.id)}
                        className="ml-2 text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Select
                      value={field.type}
                      onValueChange={(value) => updateField(table.id, field.id, { type: value })}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <div className="flex gap-1">
                      {field.required && <Badge variant="secondary" className="text-xs">Required</Badge>}
                      {field.unique && <Badge variant="outline" className="text-xs">Unique</Badge>}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`text-xs ${field.required ? 'bg-primary/20' : ''}`}
                      onClick={() => updateField(table.id, field.id, { required: !field.required })}
                    >
                      Required
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`text-xs ${field.unique ? 'bg-primary/20' : ''}`}
                      onClick={() => updateField(table.id, field.id, { unique: !field.unique })}
                    >
                      Unique
                    </Button>
                  </div>
                </div>
              ))}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => addField(table.id)}
                className="w-full"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Field
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {tables.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No tables created yet. Add your first table to get started!</p>
        </div>
      )}
    </div>
  );
};
