/* eslint-env jquery, browser, es6 */
{
	'use strict';
	let n = 4; // Default dimension
	let empty; // Allows global tracking of empty space
	let shuffled = false;

	$(window).load(() => {
		setTiles();
		toggleDimensionChangers();
		shuffleButton();
	});

	// Set classes and styles
	function setTiles() {
		generateTiles();
		let index = 1;
		$('#puzzlearea')
			.css('width', `${n * 100}px`).css('height', `${n * 100}px`) // Set container size to fit dimensions
			.children()
			.attr('class', 'puzzlepiece') // Add 'puzzlepiece' class to each div
			.each(function () {
				const row = Math.ceil(index / n);
				const col = (index % n === 0) ? n : index % n;
				$(this).css('top', convertBack(row))
					.css('left', convertBack(col))
					.css('background-image', `url(./images/background${n}.jpg)`) // Choose appropriately scaled image for current dimension
					.css('background-position', `-${convertBack(col)} -${convertBack(row)}`);
				index++;
			});
		empty = {row: convertBack(n), col: convertBack(n)};
		setHover();
		tileSwap();
	}

	// Destroy all elements withing #puzzlearea and regenerate n^2 divs with text numbering 1 - (n^2-1)
	function generateTiles() {
		const container = $('#puzzlearea');
		container.empty();
		for (let i = 1; i < n ** 2; i++) {
			$('<div>').text(i).appendTo(container);
		}
	}

	// Set up events for when each button is clicked
	// Set dimension, disable win state if enabled, regenerate tiles
	function toggleDimensionChangers() {
		$('#three').click(() => {
			n = 3;
			toggleWin();
			setTiles();
		});
		$('#four').click(() => {
			n = 4;
			toggleWin();
			setTiles();
		});
		$('#five').click(() => {
			n = 5;
			toggleWin();
			setTiles();
		});
		$('#six').click(() => {
			n = 6;
			toggleWin();
			setTiles();
		});
	}

	// Filter which puzzle pieces are adjacent to the empty space and toggle the movablepiece class
	function setHover() {
		$('.puzzlepiece').each(function () {
			if (isAdjacent($(this))) {
				$(this).addClass('movablepiece');
			} else {
				$(this).removeClass('movablepiece');
			}
		});
	}

	// Event handler for clicking on a tile causing it to swap
	// Dependent event is setHover(), and need to check if this swap resulted in solved state
	// Timeout is to make sure the swap finishes before executing the next instructions.
	function tileSwap() {
		$('.puzzlepiece').click(function () {
			if (isAdjacent($(this))) {
				animatedSwap($(this));
				setTimeout(() => {
					setHover();
					alertIfSolved();
				}, 500);
			}
		});
	}

	// First check if the puzzle has been won.
	// Then shuffle() and set up dependent events, hover and swap
	function shuffleButton() {
		$('#shufflebutton').click(() => {
			toggleWin();
			setTiles();
			shuffle();
			setHover(); //wa
			tileSwap();
		});
	}

	// Turn off win state
	function toggleWin() {
		shuffled = false;
		if ($('#puzzlearea').attr('class') === 'win') {
			$('#puzzlearea').removeClass('win').css('background-image', '');
		}
	}

	// Verify the tiles are in order based on fetching each tile with its css coordinates
	// And comparing with the expected text value in the current tile
	// If they're all in order, perform victory operation.
	function alertIfSolved() {
		// Only do the full check if empty is in the right spot
		if (!shuffled || JSON.stringify(empty) === JSON.stringify({col: convertBack(n), row: convertBack(n)})) {
			return;
		}

		let index = 1;
		let solved = true;
		for (let row = 1; row <= n; row++) {
			for (let col = 1; col <= n; col++) {
				if (row === n && col === n) { // If the puzzle is solved, (n,n) will be empty
					break;
				}

				const text = parseInt($(getTile(row, col)).text(), 10);
				if (text !== index++) {
					solved = false;
					break;
				}
			}
		}

		if (solved) {
			$('#puzzlearea').addClass('win').css('background-image', `url(./images/background${n}.jpg)`).text('You win!!!');
		}
	}

	// Perform n * 100 swaps with a random selection of all adjacent tiles to the empty space
	// 997 is a nice, large, prime number for optimal distribution in the adj array.
	function shuffle() {
		for (let i = 0; i < n * 100; i++) {
			const adj = allAdjacent();
			const target = adj[parseInt(Math.random() * 997, 10) % adj.length];
			const tile = getTile(target.row, target.col);
			swap(tile);
		}
		shuffled = true;
	}

	// Return an array of all valid coords adjacent to empty - 4 possible
	function allAdjacent() {
		const row = convert(empty.row);
		const col = convert(empty.col);
		const adj = [];
		if (row !== n) {
			adj.push({row: row + 1, col});
		}

		if (row !== 1) {
			adj.push({row: row - 1, col});
		}

		if (col !== n) {
			adj.push({row, col: col + 1});
		}

		if (col !== 1) {
			adj.push({row, col: col - 1});
		}

		return adj;
	}

	// Tests for adjacency witht the empty tile based on the distance formula using the
	// Css coordinates of the specified and empty tile.
	function isAdjacent(tile) {
		const coords = getCoords(tile);
		const dist = Math.sqrt(
			((parseInt(coords.row, 10) - parseInt(empty.row, 10)) ** 2) +
			((parseInt(coords.col, 10) - parseInt(empty.col, 10)) ** 2));
		return dist === 100;
	}

	// Returns the coordinates of a given tile in the form (0px, 200px)
	function getCoords(tile) {
		const row = tile.css('top');
		const col = tile.css('left');
		return {row, col};
	}

	// Insta-swap of a tile with the empty tile
	function swap(tile) {
		const coords = getCoords(tile);
		tile.css('top', `${empty.row}`).css('left', `${empty.col}`);
		empty = coords;
	}

	// Animated swap of a tile with the empty tile, then update empty tile's new coordinates
	function animatedSwap(tile) {
		const coords = getCoords(tile);
		const speed = 300; //ms
		tile.animate({
			top: `${empty.row}`,
			left: `${empty.col}`
		}, speed);
		empty = coords;
	}

	// Finds a tile based on converting (row, col) to css coordinates
	// And seeing which tile has those coordinates
	function getTile(row, col) {
		const element = $('.puzzlepiece').filter(function () {
			return $(this).css('top') === convertBack(row);
		})
			.filter(function () {
				return $(this).css('left') === convertBack(col);
			});
		return $(element);
	}

	// Takes a css parameter like '300px' and converts into its index, in this case 4
	function convert(str) {
		return (parseInt(str, 10) / 100) + 1;
	}

	// Takes an index and converts it into the css parameter, the inverse of above
	function convertBack(num) {
		return `${(num - 1) * 100}px`;
	}
}
