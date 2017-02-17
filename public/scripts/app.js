console.log("sanity check: JS connected!");

  $(document).ready(function(){

    var $mainDiv = $('.container.main-content');

    //After button is clicked, the page clears and loads a question
    var takeQuiz = $('button');
    takeQuiz.click(function(event){
      clearPage();
      loadQuestion();
    });

  //Function to clear the page
  function clearPage(){
    $mainDiv.empty();
  }

  //Appends the result and form to the page
  function loadCreaturePage(creatureType){

    $.ajax({
      method: "GET",
      url: '/api/creatures/',
      success: captureCreature,
      error: onError
    });

    function captureCreature(creatures){
      creatures.forEach(function(creature){
        if(creature.creatureType == creatureType){
          creatureType = creature;
          $mainDiv.append(`
            <div class="creature">
              <img src='${creatureType.imageUrl}'>
              <h1>You are a ${creatureType.creatureType}!</h1>
              <p>${creatureType.description}</p>
            </div>
            <div class="userData">
              <form>
                <div class="row">
                  <div class="col-md-offset-3 col-md-3"><label>Name</label></div><div class="col-md-3"><input type="text" name="name" required></div>
                </div>
                <div class="row">
                  <div class="col-md-offset-3 col-md-3"><label>City</label></div><div class="col-md-3"><input type="text" name="city" required></div>
                </div>
                <div class="row">
                  <div class="col-md-offset-3 col-md-3"><label>Age</label></div><div class="col-md-3"><input type="text" name="age" required></div>
                </div>
                <div class="row">
                  <div class="col-md-offset-3 col-md-3"><label>Gender</label></div><div class="col-md-3"><input type="radio" value="male" name="gender" required>Male <input type="radio" value="female" name="gender">Female</div>
                </div>
                <div class="row">
                  <div class="col-md-offset-3 col-md-3"><label>Favorite Color</label></div><div class="col-md-3"><input type="text" name="favoriteColor" required></div>
                </div>
                <div class="row">
                  <div class="col-md-offset-3 col-md-3"><label>Favorite Food</label></div><div class="col-md-3"><input type="text" name="favoriteFood" required></div>
                </div>
                <input type="hidden" name="creature" value="Hobbit">
                <div class="row">
                  <div class="col-md-offset-3 col-md-3"><input type="submit"></div>
                </div>
              </form>
            </div>
            <div class="allUsers">
            </div>
            `);

            var $form = $('form');
            $form.on('submit', function(event){
              event.preventDefault();
              $.ajax({
                method: 'POST',
                url: '/api/users',
                data: $form.serialize(),
                success: loadMainProfile,
                error: onError
              });
            });
        }
      });
    }
  }

  function onError(xhr, ajaxOptions, thrownError){
    console.log(xhr);
    console.log(ajaxOptions);
    console.log(thrownError);
  }



  function loadMainProfile(newUser){
    $('.userData').empty();
  	$('.userData').append(`<p>${newUser.name}</p>`)

  	loadProfiles();
  }


  //GETS ALL User profiles and renders to page
  function loadProfiles() {
	$.ajax({
      method: 'GET',
      url: '/api/users',
      success: renderMultipleUsers,
      error: onError
  	});

  	function renderMultipleUsers(users) {
  	  users.forEach(function(user) {
        renderUser(user);
      });
    }

    function renderUser(user) {

  	  $(".allUsers").append(
  	  	`<div class="userOnPage" data-user-id="${user._id}">
  	  		<div>
  	  			<img src="#">
  	  		</div>
  	  		<p>${user.name}</p>
  	  		<p>${user.creature.creatureType}</p>
  	  		<button>delete</button>
  	  		<button>edit</button>
  	  	</div>`
  	  	);

    }
  }



// $('#albums').on('click', '.delete-album', handleDeleteAlbumClick);

// // when a delete button for an album is clicked
// function handleDeleteAlbumClick(e) {
//   var albumId = $(this).parents('.album').data('album-id');
//   console.log('someone wants to delete album id=' + albumId );
//   $.ajax({
//     url: '/api/albums/' + albumId,
//     method: 'DELETE',
//     success: handleDeleteAlbumSuccess
//   });
// }

// // callback after DELETE /api/albums/:id
// function handleDeleteAlbumSuccess(data) {
//   var deletedAlbumId = data._id;
//   console.log('removing the following album from the page:', deletedAlbumId);
//   $('div[data-album-id=' + deletedAlbumId + ']').remove();
// }



  //Appends the question and answer choices to the page
  function loadQuestion(){
    $mainDiv.append(`

      <h1>Which creature are you?</h1>
      <div class="row">
        <div class="option col-md-6" data-creature-type="Human">Hooman</div>
        <div class="option col-md-6" data-creature-type="Hobbit">Hobbit</div>
      </div>

    `);
    $('.option').click(function(){
      clearPage();
      var creatureType = $(this).data('creature-type');
      loadCreaturePage(creatureType);
    });
  }

});
