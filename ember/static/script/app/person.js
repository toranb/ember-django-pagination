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
        return PersonApp.Person.find();
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

PersonApp.PersonController = Ember.ArrayController.extend(PersonApp.PaginationMixins, {
    addPerson: function(username) {
        PersonApp.Person.createRecord({ username: username });
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
    }
});

//not part of the pagination example in any way
PersonApp.PersonView = Ember.View.extend({
    templateName: 'person',
    addPerson: function(event) {
        var username = this.get('username');
        if (username) {
            this.get('controller').addPerson(username);
            this.set('username', '');
        }
    }
});
