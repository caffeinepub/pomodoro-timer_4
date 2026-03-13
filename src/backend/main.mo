import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Text "mo:core/Text";

actor {
  type Preferences = {
    selectedPreset : Text;
    customWorkMinutes : Nat;
    customRestMinutes : Nat;
    displayMode : Text;
    background : Text;
  };

  module Preferences {
    public func compare(pref1 : Preferences, pref2 : Preferences) : Order.Order {
      switch (Text.compare(pref1.selectedPreset, pref2.selectedPreset)) {
        case (#equal) { Text.compare(pref1.displayMode, pref2.displayMode) };
        case (order) { order };
      };
    };
  };

  let users = Map.empty<Principal, Preferences>();

  public shared ({ caller }) func updatePreferences(selectedPreset : Text, customWorkMinutes : Nat, customRestMinutes : Nat, displayMode : Text, background : Text) : async () {
    let preferences = {
      selectedPreset;
      customWorkMinutes;
      customRestMinutes;
      displayMode;
      background;
    };

    users.add(caller, preferences);
  };

  public query ({ caller }) func getPreferences() : async Preferences {
    switch (users.get(caller)) {
      case (null) { Runtime.trap("No preferences found for this user.") };
      case (?preferences) { preferences };
    };
  };

  public query func getAllPreferences() : async [Preferences] {
    users.values().toArray().sort();
  };
};
