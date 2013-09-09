PersonApp = Ember.Application.create();

PersonApp.Person = DS.Model.extend({
    username: DS.attr('string'),
    
    didUpdate: function() {
        console.log("Updated");
    },
    
    didCreate: function() {
        console.log("Created");
    }
});

DS.DjangoRESTAdapter.configure("plurals", {"person" : "people"});
PersonApp.Store = DS.Store.extend({
    adapter: DS.DjangoRESTAdapter.create()
});

PersonApp.Router.map(function() {
    this.resource("person", { path: "/" }, function() {
        this.route('page', {path: '/page/:page'});
    });
    this.route("notFound", { path: "*:path" });
});

PersonApp.PersonIndexRoute = Ember.Route.extend({
    redirect: function() {
        this.transitionTo('person.page', 1);
    }
});

PersonApp.PersonPageRoute = Ember.Route.extend({
    model: function(params) {
        return PersonApp.Person.find({page: params.page});
    },
    events: {
        error: function() {
            console.info("we can transition somewhere with this handler");
            //this.transitionTo("somewhere");
        }
    }
});

PersonApp.PaginationMixins = Ember.Mixin.create({
    pagination: function() {
        if(this.get('model.isLoaded')) {
            var modelType = this.get('model.type');
            return this.get('store').typeMapFor(modelType).metadata.pagination;
        }
    }.property('model.isLoaded'),
});

PersonApp.PersonPageController = Ember.ObjectController.extend(PersonApp.PaginationMixins, {
    
    action: null,
    
    actions: {
        addPerson: function() {
            PersonApp.Person.createRecord({ username: this.get('username') });
            this.set('action','add');
            this.commit();
        },
        updatePerson: function(event) {
            this.set('action','update');
            this.commit();
        },
        deletePerson: function(event) {
            this.set('action','delete');
            event.deleteRecord();
            this.commit();
        }
    },
    
    commit: function() {
        this.get('store').commit();
        // we need to reload data from the server, as the action (add or delete) may have
        // changed object list in the current page
        var modelType = this.get('model.type');
        var current_page = this.get('store').typeMapFor(modelType).metadata.pagination.page.current;
        if ((this.get('model.length') === 1) && (this.get('action') === 'delete')) {
            current_page--;
        }
        if ((this.get('model.length') === this.get('store').typeMapFor(modelType).metadata.pagination.items.per_page) && (this.get('action') === 'add')) {
            current_page++;
        }
        this.transitionToRoute('person.page', current_page);
    }
    
});
