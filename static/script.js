document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const status = document.getElementById('status');
    const resetButton = document.getElementById('reset');
    let gameActive = true;

    // Add click event listeners to cells
    document.querySelectorAll('.cell').forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });

    // Add click event listener to reset button
    resetButton.addEventListener('click', resetGame);

    function createConfetti() {
        const colors = ['#f00', '#0f0', '#00f', '#ff0', '#f0f', '#0ff', '#f80', '#08f', '#80f'];
        const container = document.createElement('div');
        container.className = 'confetti-container';
        document.body.appendChild(container);

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        for (let i = 0; i < 300; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            
            // Random size (mostly small)
            const size = Math.random() < 0.8 ? Math.random() * 4 + 2 : Math.random() * 10 + 5;
            const width = size;
            const height = size * (Math.random() * 0.5 + 0.5);
            
            // Random skew for parallelogram effect
            const skewX = Math.random() * 30 - 15;
            const skewY = Math.random() * 30 - 15;
            
            // Random position and rotation
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 300 + 100;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            const rotation = Math.random() * 360;
            
            confetti.style.width = width + 'px';
            confetti.style.height = height + 'px';
            confetti.style.transform = `skew(${skewX}deg, ${skewY}deg)`;
            confetti.style.left = centerX + 'px';
            confetti.style.top = centerY + 'px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            
            // Set CSS variables for animation
            confetti.style.setProperty('--tx', tx + 'px');
            confetti.style.setProperty('--ty', ty + 'px');
            confetti.style.setProperty('--r', rotation + 'deg');
            
            container.appendChild(confetti);
        }

        setTimeout(() => {
            container.remove();
        }, 2000);
    }

    function handleCellClick(e) {
        if (!gameActive) return;
        
        const cell = e.currentTarget;
        const position = cell.dataset.position;
        const cellContent = cell.querySelector('.cell-content');
        const bodiImg = cell.querySelector('.bodi-img');
        
        // Check if cell is empty
        if (cellContent.textContent === '' && bodiImg.style.display === 'none') {
            makeMove(position);
        }
    }

    function makeMove(position) {
        fetch('/make_move', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ position: position })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success' || data.status === 'win' || data.status === 'draw') {
                updateBoard(data.board);
                updateStatus(data);
                
                if (data.status === 'win') {
                    gameActive = false;
                    status.textContent = data.winner === 'X' ? 'BoDi wins!' : 'You win!';
                    createConfetti();
                } else if (data.status === 'draw') {
                    gameActive = false;
                    status.textContent = "It's a draw!";
                } else {
                    status.textContent = "Your turn (O)";
                }
            }
        })
        .catch(error => console.error('Error:', error));
    }

    function updateBoard(board) {
        document.querySelectorAll('.cell').forEach((cell, index) => {
            const cellContent = cell.querySelector('.cell-content');
            const bodiImg = cell.querySelector('.bodi-img');
            
            if (board[index] === 'X') {
                cellContent.textContent = '';
                bodiImg.style.display = 'block';
            } else if (board[index] === 'O') {
                cellContent.textContent = 'O';
                bodiImg.style.display = 'none';
            } else {
                cellContent.textContent = '';
                bodiImg.style.display = 'none';
            }
        });
    }

    function updateStatus(data) {
        if (data.status === 'success') {
            status.textContent = "Your turn (O)";
        }
    }

    function resetGame() {
        fetch('/reset', {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            updateBoard(data.board);
            status.textContent = "Your turn (O)";
            gameActive = true;
        })
        .catch(error => console.error('Error:', error));
    }
}); 