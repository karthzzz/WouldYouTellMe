import sqlite3

conn = sqlite3.connect('confessions.db')
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

print('=== USERS TABLE ===')
cursor.execute('SELECT * FROM users')
rows = cursor.fetchall()
print(f'Total users: {len(rows)}')
for row in rows:
    print(dict(row))

print('\n=== CONFESSIONS TABLE ===')
cursor.execute('SELECT * FROM confessions')
rows = cursor.fetchall()
print(f'Total confessions: {len(rows)}')
for row in rows:
    print(dict(row))

print('\n=== SUBSCRIPTIONS TABLE ===')
cursor.execute('SELECT * FROM subscriptions')
rows = cursor.fetchall()
print(f'Total subscriptions: {len(rows)}')
for row in rows:
    print(dict(row))

conn.close()
