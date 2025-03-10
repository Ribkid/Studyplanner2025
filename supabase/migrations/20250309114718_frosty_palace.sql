/*
  # Seed user progress data for Python projects
  
  This migration adds test users and their progress on Python projects.
  It includes a check to ensure the python_projects table exists before attempting to operate on it.
*/

DO $$
DECLARE 
    user1_id uuid;
    user2_id uuid;
    project1_id uuid;
    project2_id uuid;
    project3_id uuid;
    table_exists boolean;
BEGIN
    -- Check if the python_projects table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'python_projects'
    ) INTO table_exists;
    
    -- Only proceed if the python_projects table exists
    IF table_exists THEN
        -- Create test users if they don't exist
        IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'pythonmaster') THEN
            INSERT INTO users (username) VALUES ('pythonmaster') RETURNING id INTO user1_id;
        ELSE
            SELECT id INTO user1_id FROM users WHERE username = 'pythonmaster';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'codelearner') THEN
            INSERT INTO users (username) VALUES ('codelearner') RETURNING id INTO user2_id;
        ELSE
            SELECT id INTO user2_id FROM users WHERE username = 'codelearner';
        END IF;
        
        -- Get project IDs (only if they exist)
        SELECT id INTO project1_id FROM python_projects WHERE order_number = 1;
        
        IF project1_id IS NOT NULL THEN
            -- Insert progress data for user1 if not exists
            IF NOT EXISTS (SELECT 1 FROM python_project_progress WHERE user_id = user1_id AND project_id = project1_id) THEN
                INSERT INTO python_project_progress (
                    user_id, 
                    project_id,
                    status,
                    user_code,
                    completed_at
                ) VALUES (
                    user1_id,
                    project1_id,
                    'completed',
                    (SELECT code_template FROM python_projects WHERE id = project1_id),
                    NOW() - INTERVAL '3 days'
                );
            END IF;
        END IF;
        
        -- Get second project ID
        SELECT id INTO project2_id FROM python_projects WHERE order_number = 2;
        
        IF project2_id IS NOT NULL THEN
            IF NOT EXISTS (SELECT 1 FROM python_project_progress WHERE user_id = user1_id AND project_id = project2_id) THEN
                INSERT INTO python_project_progress (
                    user_id, 
                    project_id,
                    status,
                    user_code,
                    completed_at
                ) VALUES (
                    user1_id,
                    project2_id,
                    'completed',
                    (SELECT code_template FROM python_projects WHERE id = project2_id),
                    NOW() - INTERVAL '2 days'
                );
            END IF;
        END IF;
        
        -- Get third project ID
        SELECT id INTO project3_id FROM python_projects WHERE order_number = 3;
        
        IF project3_id IS NOT NULL THEN
            IF NOT EXISTS (SELECT 1 FROM python_project_progress WHERE user_id = user1_id AND project_id = project3_id) THEN
                INSERT INTO python_project_progress (
                    user_id, 
                    project_id,
                    status,
                    user_code,
                    completed_at
                ) VALUES (
                    user1_id,
                    project3_id,
                    'in_progress',
                    (SELECT code_template FROM python_projects WHERE id = project3_id),
                    NULL
                );
            END IF;
        END IF;
        
        -- Insert progress data for user2 if not exists and if project1 exists
        IF project1_id IS NOT NULL THEN
            IF NOT EXISTS (SELECT 1 FROM python_project_progress WHERE user_id = user2_id AND project_id = project1_id) THEN
                INSERT INTO python_project_progress (
                    user_id, 
                    project_id,
                    status,
                    user_code,
                    completed_at
                ) VALUES (
                    user2_id,
                    project1_id,
                    'completed',
                    (SELECT code_template FROM python_projects WHERE id = project1_id),
                    NOW() - INTERVAL '1 day'
                );
            END IF;
        END IF;
    END IF;
END $$;