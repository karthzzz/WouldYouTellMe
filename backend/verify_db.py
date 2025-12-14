import sqlite3
conn = sqlite3.connect('confessions.db')
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

print('\n=== USERS ===')
cursor.execute('SELECT id, name, email, free_messages_remaining FROM users')
for row in cursor.fetchall():
    print(f"User {row[0]}: {row[1]} ({row[2]}) - Free messages left: {row[3]}")

print('\n=== CONFESSIONS ===')
cursor.execute('SELECT submission_id, recipient_name, status, is_free FROM confessions')
rows = cursor.fetchall()
print(f"Total: {len(rows)} confessions")
for row in rows:
    print(f"Submission {row[0][:8]}... to {row[1]} - Status: {row[2]} - Free: {row[3]}")

conn.close()
print('\n✅ Database check complete')
