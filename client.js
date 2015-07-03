angular.module('angularApp', [])
  .controller('angularController', function($scope, $http, $timeout) {
    $scope.currentWordArray = [];
    $scope.finishedWordArray = [];
    $scope.correctWordArray = [];
    $scope.timer = 120;
    $scope.points = 0;

    $scope.randomGenerator = function(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    };

    //timer will count down to 0
    $scope.timeObject = function() {
      if($scope.timer > 0) {
        //At the start, initialize a random word
        if($scope.timer === 120) {
          $scope.getWord();
        }

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

          $("#myModal").modal('show');
        }, 1000);
      }
    };
    //initializes the timer
    $timeout($scope.timeObject, 1000);

    $scope.checkForCompletion = function() {
      var sameLetters = true;

      if($scope.currentWordArray.length === 0) {
        for(var i = 0; i < $scope.finishedWordArray.length; i++) {
          if($scope.finishedWordArray[i].letter !== $scope.correctWordArray[i].letter) {
            sameLetters = false;
          }
        }

        //player wins round
        if(sameLetters === true) {

          if($scope.timer >= 90) {
            $scope.points += 3 * $scope.finishedWordArray.length;
          } else if ($scope.timer <= 89 && $scope.timer >= 60) {
            $scope.points += 2 * $scope.finishedWordArray.length;
          } else {
            $scope.points += $scope.finishedWordArray.length;
          }
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
      }
    };

    $scope.isNumeric = function(character) {
      character = Number(character);
      if(character === 1 || character === 2 || character === 3 || character === 4 || character === 5 || character === 6 || character === 7 || character === 8 || character === 9 || character === 0) {
        return true;
      } else {
        return false;
      }
    };

    $scope.keyboardPress = function(event) {
      var character = String.fromCharCode(event.charCode);
      if($scope.isNumeric(character) && $scope.timer > 10) {
        $scope.getWord();
        $scope.timer -= 5;
      }

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

    $scope.getWord = function() {
      $http.get('http://api.wordnik.com:80/v4/words.json/randomWord?hasDictionaryDef=true&minCorpusCount=0&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=2&maxLength=11&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5').
      success(function(data, status, headers, config) {
        
        //reset current word
        $scope.finishedWordArray = [];
        $scope.currentWordArray = [];
        $scope.correctWordArray = [];

        for(var i = 0; i < data.word.length; i++) {
          $scope.correctWordArray.push({letter: data.word[i], index: i});
          $scope.currentWordArray.push({letter: data.word[i], index: i});
        }

        for(var i = 0; i < $scope.currentWordArray.length; i++) {
          var randomIndex = $scope.randomGenerator(0, $scope.currentWordArray.length - 1);
          var temp = $scope.currentWordArray[i];
          $scope.currentWordArray[i] = $scope.currentWordArray[randomIndex];
          $scope.currentWordArray[randomIndex] = temp;
        }

        console.log("Cheat: " + data.word);
      }).
      error(function(data, status, headers, config) {
        console.log("Failed to retrieve word");
      });
    };

    $scope.restartGame = function() {
      $scope.timer = 120;
      $scope.points = 0;

      $timeout($scope.timeObject, 1000);
      $("#myModal").modal('hide');
    };

  });