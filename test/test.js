var expect = require('expect.js');
var Matrix = require('../lib/matrix');

describe('Matrix', function() {
	var m1, m2, m3, m4;

	// Reset each of the matrices before each test and turn silent mode off
	beforeEach(function() {
		m1 = new Matrix([
			[-2, 2,  3],
			[-1, 1,  3],
			[ 2, 0, -1]
		]);

		m2 = new Matrix([
			[2, 1],
			[1, 1],
			[3, 1]
		]);

		m3 = new Matrix([
			[1, 2, 3],
			[4, 5, 6],
			[7, 8, 9]
		]);

		m4 = new Matrix([
			[9, 8, 7],
			[6, 5, 4],
			[3, 2, 1]
		]);

		Matrix.silent = false;
	});

	describe('constructor', function() {
		it('should throw an error if the argument passed is not an array', function() {
			expect(function() {
				new Matrix('hi');
			}).to.throwError();
		});

		it('should create a Matrix object from a two-dimensional array', function() {
			expect(new Matrix([[1, 2], [3, 4]]).toArray()).to.eql([[1, 2], [3, 4]]);
		});

		it('should create an all zero array if a row and column number are passed', function() {
			expect(new Matrix(2, 2).toArray()).to.eql([[0, 0], [0, 0]]);
		});
	});

	describe('submatrices', function() {
		it('should slice out the given row and column', function() {
			expect(m1._submatrix(1, 1).toArray()).to.eql([
				[-2,  3],
				[ 2, -1]
			]);
		});
	});

	describe('#determinant()', function() {
		it('should throw an error if it is not a square matrix', function() {
			expect(function() {
				m2.determinant();
			}).to.throwError();
		});

		it('should return the proper determinant', function() {
			expect(m1.determinant()).to.equal(6);
		});
	});

	describe('#multiply()', function() {
		it('should throw an error if there are improper dimensions', function() {
			expect(function() {
				new Matrix(2, 2).multiply(new Matrix(3, 3));
			}).to.throwError();
		});

		it('should throw an error if the matrix to multiply is not a valid Matrix object', function() {
			expect(function() {
				m1.multiply('hi');
			}).to.throwError();
		});

		it('should multiply two matrices', function() {
			expect(m1.clone().multiply(m2).toArray()).to.eql([
				[7, 3],
				[8, 3],
				[1, 1]
			]);

			expect(m1.clone().multiply(m3).toArray()).to.eql([
				[27, 30, 33],
				[24, 27, 30],
				[-5, -4, -3]
			]);
		});
	});

	describe('#add()', function() {
		it('should throw an error if the dimensions do not match', function() {
			expect(function() {
				m1.add(m2);
			}).to.throwError();
		});

		it('should throw an error if any of the dimensions do not match', function() {
			expect(function() {
				m1.add(m3).add(m2);
			}).to.throwError();
		});

		it('should add two matrices with the same dimensions', function() {
			expect(m1.add(m3).toArray()).to.eql([
				[-1, 4, 6],
				[3, 6, 9],
				[9, 8, 8]
			]);
		});

		it('should add multiple matrices with the same dimensions', function() {
			expect(m1.add(m3, m4).toArray()).to.eql([
				[8, 12, 13],
				[9, 11, 13],
				[12, 10, 9]
			]);
		});
	});

	describe('#subtract()', function() {
		it('should throw an error if the dimensions do not match', function() {
			expect(function() {
				m1.subtract(m2);
			}).to.throwError();
		});

		it('should subtract two matrices with the same dimensions', function() {
			expect(m1.subtract(m3).toArray()).to.eql([
				[-3,  0,   0],
				[-5, -4,  -3],
				[-5, -8, -10]
			]);
		});
	});

	describe('#scalar()', function() {
		it('should throw an error if the scalar is not a number', function() {
			expect(function() {
				m1.scalar('hello');
			}).to.throwError();
		});

		it('should multiply each element in the matrix by the scalar', function() {
			expect(m1.scalar(2).toArray()).to.eql([
				[-4, 4,  6],
				[-2, 2,  6],
				[ 4, 0, -2]
			]);
		});
	});

	describe('#raise()', function() {
		it('should throw an error if the power is not an integer', function() {
			expect(function() {
				m1.raise('hello');
			}).to.throwError();

			expect(function() {
				m1.raise(1.5);
			}).to.throwError();
		});

		it('should throw an error if the power is less than 2', function() {
			expect(function() {
				m1.raise(1);
			}).to.throwError();
		});

		it('should throw an error if the matrix is not a square matrix', function() {
			expect(function() {
				m2.raise(2);
			}).to.throwError();
		});

		it('should raise the matrix to the specified power', function() {
			expect(m1.clone().raise(2).toArray()).to.eql([
				[8, -2, -3],
				[7, -1, -3],
				[-6, 4, 7]
			]);

			expect(m1.clone().raise(3).toArray()).to.eql([
				[-20, 14, 21],
				[-19, 13, 21],
				[22, -8, -13]
			]);
		});

		describe('#square()', function() {
			it('should alias #raise(2) to #square()', function() {
				expect(m1.clone().raise(2).toArray()).to.eql(m1.clone().square().toArray());
			});
		});

		describe('#cube()', function() {
			it('should alias #raise(3) to #cube()', function() {
				expect(m1.clone().raise(3).toArray()).to.eql(m1.clone().cube().toArray());
			});
		});
	});

	describe('#inverse()', function() {
		it('should invert a matrix', function() {
			// Test against a precomputed inverse
			expect(new Matrix([
				[2, 0, -1],
				[2, 1,  1],
				[3, 4,  4]
			]).inverse().toArray()).to.eql([
				[ 0,   .8, -.2],
				[ 1, -2.2,  .8],
				[-1,  1.6, -.4]
			]);

			// Generate a 20x20 array of random numbers
			var data = [];
			for (var i = 0; i < 20; i++) {
				data[i] = [];
				for (var j = 0; j < 20; j++) {
					data[i][j] = Math.floor(Math.random() * 101);
				}
			}

			// Invert the matrix and multiply it by itself
			var original = new Matrix(data);
			var inverted = original.clone().inverse();
			var product = original.multiply(inverted);

			// Check if it equals the identity matrix
			for (var i = 0; i < 20; i++) {
				for (var j = 0; j < 20; j++) {
					expect(Math.abs((i === j ? 1 : 0) - product[i][j])).to.be.lessThan(.0000001);
				}
			}
		});
	});

	describe('#equals()', function() {
		it('should return true if the two matrices are equal', function() {
			expect(m1.equals(m1.clone())).to.be(true);
		});

		it('should return false if the two matrices are not equal', function() {
			expect(m1.equals(m3.clone())).to.be(false);
		});

		it('should return false if the dimensions are not the same', function() {
			expect(m1.equals(m2.clone())).to.be(false);
		});

		it('should accept an array', function() {
			expect(m1.equals(m1.toArray())).to.be(true);
			expect(m1.equals(m3.toArray())).to.be(false);
		});
	});

	describe('Matrix.identity', function() {
		it('should create an identity matrix of any size', function() {
			expect(new Matrix.identity(2).toArray()).to.eql([
				[1, 0],
				[0, 1]
			]);

			expect(new Matrix.identity(3).toArray()).to.eql([
				[1, 0, 0],
				[0, 1, 0],
				[0, 0, 1]
			]);
		});
	});

	describe('Matrix.silent', function() {
		it('should throw an error when set to false', function() {
			Matrix.silent = false;

			expect(function() {
				m2.raise(2);
			}).to.throwError();
		});

		it('should not throw an error when set to true', function() {
			Matrix.silent = true;

			expect(function() {
				m2.raise(2);
			}).to.not.throwError();
		});
	});

	describe('#_setData()', function() {
		it('should accept a two dimensional array', function() {
			expect(m1._setData([[1,2], [3,4]]).toArray()).to.eql([[1,2], [3,4]]);
		});

		it('should accept a matrix object', function() {
			expect(m1._setData(m2).toArray()).to.eql([
				[2, 1],
				[1, 1],
				[3, 1]
			]);
		});

		it('should accept a function that takes the row and column numbers as parameters', function() {
			expect(m1._setData(function(row, col) {
				return row * col;
			}).toArray()).to.eql([
				[0, 0, 0],
				[0, 1, 2],
				[0, 2, 4]
			]);
		});

		it('should update the row and column count of the matrix', function() {
			m1._setData([[1,2], [3,4]]);

			expect(m1.rows).to.equal(2);
			expect(m1.cols).to.equal(2);
		});
	});
});