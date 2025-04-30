from flask import Flask, render_template, request, jsonify
import random

app = Flask(__name__)

# Initialize the game board
board = [''] * 9
current_player = 'O'  # Human starts first

def get_winning_move(player):
    # Check rows
    for i in range(0, 9, 3):
        row = board[i:i+3]
        if row.count(player) == 2 and '' in row:
            return i + row.index('')
    
    # Check columns
    for i in range(3):
        col = [board[i], board[i+3], board[i+6]]
        if col.count(player) == 2 and '' in col:
            return i + col.index('') * 3
    
    # Check diagonals
    diag1 = [board[0], board[4], board[8]]
    if diag1.count(player) == 2 and '' in diag1:
        return [0, 4, 8][diag1.index('')]
    
    diag2 = [board[2], board[4], board[6]]
    if diag2.count(player) == 2 and '' in diag2:
        return [2, 4, 6][diag2.index('')]
    
    return None

def get_computer_move():
    # Try to win
    move = get_winning_move('X')
    if move is not None:
        return move
    
    # Block human from winning
    move = get_winning_move('O')
    if move is not None:
        return move
    
    # Take center if available
    if board[4] == '':
        return 4
    
    # Take corners if available
    corners = [0, 2, 6, 8]
    available_corners = [c for c in corners if board[c] == '']
    if available_corners:
        return random.choice(available_corners)
    
    # Take any available space
    available_moves = [i for i, x in enumerate(board) if x == '']
    return random.choice(available_moves)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/make_move', methods=['POST'])
def make_move():
    global current_player
    position = int(request.json['position'])
    
    # Check if the move is valid
    if board[position] == '':
        board[position] = current_player
        
        # Check for winner
        winner = check_winner()
        if winner:
            return jsonify({
                'status': 'win',
                'winner': winner,
                'board': board
            })
        
        # Check for draw
        if '' not in board:
            return jsonify({
                'status': 'draw',
                'board': board
            })
        
        # Computer's turn
        if current_player == 'O':
            current_player = 'X'
            computer_move = get_computer_move()
            board[computer_move] = 'X'
            
            # Check for winner after computer move
            winner = check_winner()
            if winner:
                return jsonify({
                    'status': 'win',
                    'winner': winner,
                    'board': board
                })
            
            # Check for draw after computer move
            if '' not in board:
                return jsonify({
                    'status': 'draw',
                    'board': board
                })
            
            current_player = 'O'
        
        return jsonify({
            'status': 'success',
            'board': board,
            'current_player': current_player
        })
    
    return jsonify({
        'status': 'invalid',
        'message': 'Invalid move'
    })

@app.route('/reset', methods=['POST'])
def reset():
    global board, current_player
    board = [''] * 9
    current_player = 'O'  # Human starts first
    return jsonify({
        'status': 'success',
        'board': board,
        'current_player': current_player
    })

def check_winner():
    # Check rows
    for i in range(0, 9, 3):
        if board[i] == board[i+1] == board[i+2] != '':
            return board[i]
    
    # Check columns
    for i in range(3):
        if board[i] == board[i+3] == board[i+6] != '':
            return board[i]
    
    # Check diagonals
    if board[0] == board[4] == board[8] != '':
        return board[0]
    if board[2] == board[4] == board[6] != '':
        return board[2]
    
    return None

if __name__ == '__main__':
    app.run(debug=True) 