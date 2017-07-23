$(document).ready(function(){

  var newElements = $('input').filter(function() {
      return $(this).val() === '0';
  });


  function addClassToNew(){

    $.each(newElements, function( k, v ) {
      $(v).closest('li').addClass('effect');
    });


  }

addClassToNew();

$('.submit-button').click(function(){
    if( $('input').val() !== ''){
          $.LoadingOverlay("show");
    }
})

})
