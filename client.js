angular.module('angularApp', [])
  .controller('angularController', function($scope, $http, $timeout) {

    $http.get('/api/winners').
      success(function(data) {
        console.log(data + ' winner(s) so far!');
      }).
      error(function() {
        console.log('Database retrieval failed');
      });
    
    //game logic is mainly handled between the following two arrays:
    $scope.finishedWordArray = []; 
    $scope.currentWordArray = []; 

    //scrambled array for checking purposes
    $scope.scrambledCorrectWordArray = [];
    
    //time remaining in terms of seconds
    $scope.timer = 120;
    
    //points accumulated in a single round
    $scope.points = 0;
    
    //returns an integer between @min and @max
    $scope.randomGenerator = function(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    };

    //loading quotes for personal amusement
    $scope.loading = function() {
      var quotes = [
      "There is no emotion...", "There is peace.",
      "These blast points...", "too accurate for sand people.",
      "You will never find a more wretched hive of scum and villainy...", "We must be cautious.",
      "We seem to be made to suffer...", "It's our lot in life.",
      "Help me, Obi-Wan Kenobi...", "you're my only hope.",
      "I sense something...", "a presence I've not felt since...",
      ];

      var value = $scope.randomGenerator(0, Math.floor((quotes.length - 1) / 2));
      value *= 2;

      $scope.finishedWordArray.push({letter: quotes[value]});
      $scope.currentWordArray.push({letter: quotes[value + 1]});
    };
    //initialize loading quotes
    $scope.loading();


    //timer will count down to 0, starting at 120 seconds
    $scope.timeObject = function() {
      if($scope.timer > 0) {
        //At the start, initialize a random word
        if($scope.timer === 120) {
          $scope.getWord();
        }

        //change timer color based on amount of time left
        if($scope.timer >= 90) {
          $('.timer').css('color', '#7FDBFF'); //aqua
        } else if($scope.timer <= 89 && $scope.timer >= 60) {
          $('.timer').css('color', '#2ECC40'); //lime
        } else if($scope.timer <= 59 && $scope.timer >= 30) {
          $('.timer').css('color', '#FFDC00'); //yellow
        } else if($scope.timer <= 29) { 
          $('.timer').css('color', '#FF4136'); //red
        }

        //timer countdown functionality
        $timeout(function() {
          $scope.timer--;
          $scope.timeObject();
        }, 1000);
      } else {

        //gives some time for the game to end
        $timeout(function() {
         
          //can't escape modal via clicking outside or hitting escape
          $('#myModal').modal({
            backdrop: 'static',
            keyboard: false
          });

          //show modal
          $("#myModal").modal('show');
        }, 1000);
      }
    };
    //initializes the timer
    $timeout($scope.timeObject, 1000);

    //Once you hit beyond a certain threshold, you win the game
    $scope.winGame = function() {
      $('.text-warning').text('You\'ve beaten the game!');
         
      //can't escape modal via clicking outside or hitting escape
      $('#myModal').modal({
        backdrop: 'static',
        keyboard: false
      });

      //show modal
      $("#myModal").modal('show');
      
      $http.post('/api/winners', {winner: 1}).
        success(function(data) {
          console.log('Successfully sent to winner API endpoint');
        }).
        error(function() {
          console.log('Error in sending item to winner API endpoint');
        });
    };

    //once $scope.finishedWordArray is completely filled, then check if word is correct
    $scope.checkForCompletion = function() {
      var sameLetters = true;
      var letters = '';

      if($scope.currentWordArray.length === 0) {
        for(var i = 0; i < $scope.finishedWordArray.length; i++) {
          letters += $scope.finishedWordArray[i].letter;
        }

        //allows for anagrams to count towards point system
        $http.get('http://api.wordnik.com/v4/word.json/' + letters + '/definitions?api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5').
          success(function(data) {

            if(data.length === 0) { //anagram does not exist
              sameLetters = false;
            } else {
              sameLetters = true; //anagram exists
            }

            //player wins round
            if(sameLetters === true) {

              //the faster the player completes the word, the more points he/she gets
              if($scope.timer >= 90) {
                if($scope.points < 100) {
                  $scope.points += 3 * $scope.finishedWordArray.length;
                } else if($scope.points >= 100 && $scope.points < 999) {
                  $scope.points += 10 * $scope.finishedWordArray.length;
                } else if($scope.points >= 1000 && $scope.points < 9999) {
                  $scope.points += 100 * $scope.finishedWordArray.length;
                } else if($scope.points >= 10000 && $scope.points < 99999) {
                  $scope.points += 1000 * $scope.finishedWordArray.length;
                } else if($scope.points > 99999) {
                  $scope.winGame();
                }

              } else if ($scope.timer <= 89 && $scope.timer >= 60) {
                $scope.points += 2 * $scope.finishedWordArray.length;
              } else {
                $scope.points += $scope.finishedWordArray.length;
              }

              //now reset time and grab a new word
              $scope.timer = 120;
              $scope.getWord();

            } else { //or player loses round

              $scope.points -= 1;

              //place back letters into current Array
              $scope.currentWordArray = [];

              for(var i = 0; i < $scope.finishedWordArray.length; i++) {
                $scope.currentWordArray.push($scope.finishedWordArray[i]);
              }

              //empty out already typed out letters
              $scope.finishedWordArray = [];
            }

          }).
          error(function(data) {
            console.log("Anagram failed to load");
          });
      }
    };

    //function used to check if keyboard press is a number
    $scope.isNumeric = function(character) {
      character = Number(character);
      if(character === 1 || character === 2 || character === 3 || character === 4 || character === 5 || character === 6 || character === 7 || character === 8 || character === 9 || character === 0) {
        return true;
      } else {
        return false;
      }
    };

    //checks which key the user presses
    $scope.keyboardPress = function(event) {
      var character = String.fromCharCode(event.charCode);

      //if key is a number, then grab a new word and give a 5 second penalty
      if($scope.isNumeric(character) && $scope.timer > 10) {
        $scope.getWord();
        $scope.timer -= 5;
      }
      
      //disable character once it has been pressed
      var cont = true;
      for(var i = 0; i < $scope.currentWordArray.length; i++) {

        if(character === $scope.currentWordArray[i].letter && cont === true) {          
          //in case there are two repeating letters
          cont = false;

          //push character to finished array
          $scope.finishedWordArray.push($scope.currentWordArray[i]);

          //delete element from current Array
          $scope.currentWordArray.splice(i, 1);
        }
      }

      //checks if entire word array has been typed
      $scope.checkForCompletion();
    };

    //grabs a random word
    $scope.getWord = function() {
      //can't use https, as you get an error
      $http.get('http://api.wordnik.com:80/v4/words.json/randomWord?hasDictionaryDef=true&includePartOfSpeech=adjective&excludePartOfSpeech=pronoun&minCorpusCount=0&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=1&maxLength=11&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5').
      success(function(data, status, headers, config) {
        
        //reset current word
        $scope.finishedWordArray = [];
        $scope.currentWordArray = [];

        //pushes each character to @correct and @current arrays
        for(var i = 0; i < data.word.length; i++) {
          $scope.currentWordArray.push({letter: data.word[i], index: i});
        }

        //scrambles array in @current to allow user to guess
        for(var i = 0; i < $scope.currentWordArray.length; i++) {
          var randomIndex = $scope.randomGenerator(0, $scope.currentWordArray.length - 1);
          var temp = $scope.currentWordArray[i];
          $scope.currentWordArray[i] = $scope.currentWordArray[randomIndex];
          $scope.currentWordArray[randomIndex] = temp;
        }

        //for resetting purposes
        for(var i = 0; i < $scope.currentWordArray.length; i++) {
          $scope.scrambledCorrectWordArray[i] = $scope.currentWordArray[i];
        }

        //in case user can't figure out the word
        console.log("Cheat: " + data.word);
      }).
      error(function(data, status, headers, config) {
        console.log("Failed to retrieve word");
      });
    };

    $scope.restartGame = function() {
      //reset points and timer
      $scope.timer = 120;
      $scope.points = 0;

      //restart game and remove modal
      $timeout($scope.timeObject, 1000);
      $("#myModal").modal('hide');

      //reset text to losing condition
      $('.text-warning').text('Think you can do better?');
    };

  });