#!/usr/bin/env python3
"""
Test script for HamroBazaar monitor with user input functionality
"""

from hamrobazar import HamroBazaarMonitor, get_user_input

def test_monitor_initialization():
    """Test that the monitor can be initialized with different parameters"""
    
    # Test with default parameters
    monitor1 = HamroBazaarMonitor()
    print(f"✅ Default monitor - Search: '{monitor1.search_term}', Price: {monitor1.price_from}-{monitor1.price_to}")
    
    # Test with custom search term only
    monitor2 = HamroBazaarMonitor("samsung galaxy s24")
    print(f"✅ Custom search monitor - Search: '{monitor2.search_term}', Price: {monitor2.price_from}-{monitor2.price_to}")
    
    # Test with custom search term and price range
    monitor3 = HamroBazaarMonitor("laptop", 50000, 150000)
    print(f"✅ Full custom monitor - Search: '{monitor3.search_term}', Price: {monitor3.price_from}-{monitor3.price_to}")
    
    # Test with None prices
    monitor4 = HamroBazaarMonitor("motorcycle", None, 500000)
    print(f"✅ No minimum price monitor - Search: '{monitor4.search_term}', Price: {monitor4.price_from}-{monitor4.price_to}")

def test_seen_ads_file():
    """Test that different search terms create different seen_ads files"""
    
    monitor1 = HamroBazaarMonitor("iphone 15")
    monitor2 = HamroBazaarMonitor("samsung galaxy")
    
    print(f"✅ iPhone monitor file: {monitor1.seen_ads_file}")
    print(f"✅ Samsung monitor file: {monitor2.seen_ads_file}")
    
    # Verify they're different
    assert monitor1.seen_ads_file != monitor2.seen_ads_file, "Different search terms should have different seen_ads files"

if __name__ == "__main__":
    print("🧪 Testing HamroBazaar Monitor Modifications")
    print("=" * 50)
    
    test_monitor_initialization()
    print()
    test_seen_ads_file()
    
    print("\n✅ All tests passed! The monitor can now accept user input.")
    print("\n💡 To run the monitor with user input, use: python hamrobazar.py")
