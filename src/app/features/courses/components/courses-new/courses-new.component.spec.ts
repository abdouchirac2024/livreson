import {ComponentFixture, fakeAsync, TestBed, tick, waitForAsync} from '@angular/core/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule} from '@angular/forms';
import {ChangeDetectorRef} from '@angular/core';
import {of} from 'rxjs';

import {CoursesNewComponent} from './courses-new.component';
import {CoursesService} from '../../services/courses.service';
import {AuthService} from '../../../auth/services/auth.service';
import {Course, DropdownOption} from '../../models/course.model';

// Import PrimeNG Modules used in the component's template
import {CurrencyPipe, DatePipe} from '@angular/common';
import {UsersModel} from '../../../users/model/users.model';


// --- MOCKS POUR LES TESTS UNITAIRES ---
// Ces mocks simulent les réponses API et les données utilisateur.
// ILS NE SONT PAS UTILISÉS EN PRODUCTION.

const mockUserSingleCity: UsersModel = {
  id: 1, uid: 'u1', uuid: 'uuid1', email: 'user@test.com', fullname: 'User Test Ville Unique', city: [10],
  // ... autres champs obligatoires de ApiUserData avec des valeurs par défaut
  provider_id: "1", provider_name: "localhost", email_masked: "u***@t***.com", name: null,
  firstname: "User", lastname: "Test", telephone: "600000000", telephone_masked: "600***000",
  telephone_alt: null, quote: null, qualite: null, ville: null, description: null, modules: null,
  adresse: null, last_login_at: new Date().toISOString(), last_login_ip: "127.0.0.1",
  onesignal_email_auth_hash: "hash", agenda: null, nbre_courses_distribuable: null,
  caution_incrementation_courses_distribuable: null, magasins_ids: [],
  email_verified_at: new Date().toISOString(), phone_verified_at: new Date().toISOString(),
  roles: ["user"], permissions: [], zones: [], created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(), deleted_at: null
};

const mockUserAllCities: UsersModel = {
  ...mockUserSingleCity, // Copie les valeurs par défaut
  id: 2, uid: 'u2', uuid: 'uuid2', fullname: 'User Test Toutes Villes',
  city: [] // Vide signifie accès à toutes les villes dans notre logique de composant
};

const mockSystemVilles: DropdownOption[] = [
  {id: 10, name: 'Ville Alpha (API)'},
  {id: 20, name: 'Ville Beta (API)'},
  {id: 30, name: 'Ville Gamma (API)'}
];

const mockCoursiersVille10: DropdownOption[] = [{id: 101, name: 'Coursier A Alpha'}];
const mockMagasinsVille10: DropdownOption[] = [{id: 201, name: 'Magasin X Alpha'}];
const mockQuartiersVille10: DropdownOption[] = [{id: 301, name: 'Quartier Centre Alpha'}];

const mockCourses: Course[] = [
  // ... quelques exemples de courses si nécessaire pour tester l'affichage/filtrage
];
// --- FIN DES MOCKS ---


describe('CoursesNewComponent', () => {
  let component: CoursesNewComponent;
  let fixture: ComponentFixture<CoursesNewComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockCoursesService: jasmine.SpyObj<CoursesService>;
  let mockCdr: jasmine.SpyObj<ChangeDetectorRef>;

  beforeEach(waitForAsync(() => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['getAuthenticatedUser']);
    mockCoursesService = jasmine.createSpyObj('CoursesService', [
      'getAllVillesOptions',
      'getCoursiersOptions',
      'getMagasinsOptions',
      'getQuartiersOptions',
      'getFilteredCourses'
    ]);
    mockCdr = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);

    TestBed.configureTestingModule({
      imports: [
        CoursesNewComponent, // Le composant est standalone, il importe ses dépendances
        HttpClientTestingModule, // Pour les services qui pourraient l'utiliser
        NoopAnimationsModule,    // Pour éviter les erreurs d'animation
        FormsModule,             // Pour ngModel
        // Les modules PrimeNG sont importés par CoursesNewComponent lui-même
      ],
      providers: [
        {provide: AuthService, useValue: mockAuthService},
        {provide: CoursesService, useValue: mockCoursesService},
        {provide: ChangeDetectorRef, useValue: mockCdr},
        CurrencyPipe, DatePipe // Fournir les pipes utilisés dans le template
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoursesNewComponent);
    component = fixture.componentInstance;

    // Retours par défaut pour les spies (peuvent être surchargés dans les tests spécifiques)
    mockCoursesService.getAllVillesOptions.and.returnValue(of(mockSystemVilles));
    mockCoursesService.getCoursiersOptions.and.returnValue(of([]));
    mockCoursesService.getMagasinsOptions.and.returnValue(of([]));
    mockCoursesService.getQuartiersOptions.and.returnValue(of([]));
    mockCoursesService.getFilteredCourses.and.returnValue(of(mockCourses));
  });

  it('should create', () => {
    mockAuthService.getAuthenticatedUser.and.returnValue(mockUserAllCities); // Simuler un utilisateur
    fixture.detectChanges(); // Déclenche ngOnInit
    expect(component).toBeTruthy();
  });

  describe('Initialization with a user assigned to a single city', () => {
    beforeEach(() => {
      mockAuthService.getAuthenticatedUser.and.returnValue(mockUserSingleCity);
      // Simuler que seule la ville assignée est retournée, ou que le filtrage se fait bien.
      // Pour ce test, on va dire que getAllVillesOptions retourne toutes les villes,
      // et le composant filtre ensuite.
      mockCoursesService.getAllVillesOptions.and.returnValue(of(mockSystemVilles));
      mockCoursesService.getCoursiersOptions.withArgs(10).and.returnValue(of(mockCoursiersVille10));
      mockCoursesService.getMagasinsOptions.withArgs(10).and.returnValue(of(mockMagasinsVille10));
      mockCoursesService.getQuartiersOptions.withArgs(10).and.returnValue(of(mockQuartiersVille10));
    });

    it('should pre-select the assigned city, disable city dropdown, and load dependent options', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Laisse le temps à getAllVillesOptions de se résoudre
      fixture.detectChanges();
      tick(); // Laisse le temps à forkJoin (loadDependentOptionsAndCourses) de se résoudre

      expect(component.filterVilleOption).toEqual(jasmine.objectContaining({id: 10}));
      expect(component.isVilleDropdownDisabled).toBeTrue();
      expect(component.citiesOptions.length).toBe(2); // "Toutes les villes" (non sélectionnable ici) + la ville assignée
      expect(mockCoursesService.getCoursiersOptions).toHaveBeenCalledWith(10);
      expect(component.coursiersOptions).toContain(jasmine.objectContaining({id: 101}));
      expect(mockCoursesService.getFilteredCourses).toHaveBeenCalled(); // Doit être appelé à la fin
    }));
  });

  describe('Initialization with a user having access to all cities', () => {
    beforeEach(() => {
      mockAuthService.getAuthenticatedUser.and.returnValue(mockUserAllCities);
      mockCoursesService.getAllVillesOptions.and.returnValue(of(mockSystemVilles));
      // Pour "toutes les villes" (ID null), les options dépendantes doivent être vides initialement
      mockCoursesService.getCoursiersOptions.withArgs(null).and.returnValue(of([]));
      mockCoursesService.getMagasinsOptions.withArgs(null).and.returnValue(of([]));
      // getQuartiersOptions ne devrait pas être appelé avec null
    });

    it('should load all system cities, enable city dropdown, and select "Toutes les villes"', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // getAllVillesOptions
      fixture.detectChanges();
      tick(); // loadDependentOptionsAndCourses (avec cityId=null)

      expect(component.filterVilleOption).toEqual(jasmine.objectContaining({id: null, name: 'Toutes les villes'}));
      expect(component.isVilleDropdownDisabled).toBeFalse();
      expect(component.citiesOptions.length).toBe(mockSystemVilles.length + 1); // "Toutes les villes" + les autres
      expect(mockCoursesService.getCoursiersOptions).toHaveBeenCalledWith(null);
      expect(mockCoursesService.getMagasinsOptions).toHaveBeenCalledWith(null);
      expect(mockCoursesService.getQuartiersOptions).not.toHaveBeenCalledWith(jasmine.any(Number)); // Pas d'appel avec un ID numérique
      expect(mockCoursesService.getFilteredCourses).toHaveBeenCalled();
    }));

    it('should load dependent options when a city is selected from dropdown', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Initial load
      fixture.detectChanges();
      tick(); // Initial load

      const cityToSelect = mockSystemVilles[1]; // Ville Beta (ID 20)
      mockCoursesService.getCoursiersOptions.withArgs(20).and.returnValue(of([{id: 102, name: 'Coursier B Beta'}]));
      mockCoursesService.getMagasinsOptions.withArgs(20).and.returnValue(of([{id: 202, name: 'Magasin Y Beta'}]));
      mockCoursesService.getQuartiersOptions.withArgs(20).and.returnValue(of([{id: 302, name: 'Quartier Nord Beta'}]));

      // component.onCityChange({value: cityToSelect});
      tick(); // Laisse le temps à forkJoin de se résoudre
      fixture.detectChanges();

      expect(component.filterVilleOption).toEqual(cityToSelect);
      expect(mockCoursesService.getCoursiersOptions).toHaveBeenCalledWith(20);
      expect(mockCoursesService.getMagasinsOptions).toHaveBeenCalledWith(20);
      expect(mockCoursesService.getQuartiersOptions).toHaveBeenCalledWith(20);
      expect(component.coursiersOptions).toContain(jasmine.objectContaining({id: 102}));
      // getFilteredCourses a été appelé une fois à l'init, et une autre fois après le changement de ville et le rechargement des options
      expect(mockCoursesService.getFilteredCourses).toHaveBeenCalledTimes(2);
    }));
  });

  // Ajoutez d'autres tests pour applyFilters, getSeverity, etc.
});
