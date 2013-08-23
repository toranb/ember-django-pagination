PersonApp = Ember.Application.create();

PersonApp.Person = DS.Model.extend({
    username: DS.attr('string')
});

DS.DjangoRESTAdapter.configure("plurals", {"person" : "people"});
PersonApp.Store = DS.Store.extend({
    adapter: DS.DjangoRESTAdapter.create()
});

PersonApp.Router.map(function(match) {
    this.resource("person", { path: "/" }, function() {
        this.route('page', {path: '/page/:page'});
    });
});

PersonApp.PersonIndexRoute = Ember.Route.extend({
    redirect: function() {
        this.transitionTo('person.page', 1);
    },
});

PersonApp.PersonPageRoute = Ember.Route.extend({
    model: function(params) {
        return PersonApp.Person.find({page: params.page});
    },
});

PersonApp.PaginationMixins = Ember.Mixin.create({
    pagination: function() {
        if(this.get('model.isLoaded')) {
            var modelType = this.get('model.type');
            return this.get('store').typeMapFor(modelType).metadata.pagination;
        }
    }.property('model.isLoaded'),
});

PersonApp.PersonPageController = Ember.ArrayController.extend(PersonApp.PaginationMixins, {
    username: "username",

    addPerson: function() {
        PersonApp.Person.createRecord({ username: this.get('username') });
        this.commit();
    },
    updatePerson: function(event) {
        this.commit();
    },
    deletePerson: function(event) {
        event.deleteRecord();
        this.commit();
    },
    commit: function() {
        this.get('store').commit();
        // we need to reload data from the server, as the action (add or delete) may have
        // changed object list in the current page
        var modelType = this.get('model.type');
        var current_page = this.get('store').typeMapFor(modelType).metadata.pagination.current;
        this.transitionToRoute('person.page', current_page);
    }
});
