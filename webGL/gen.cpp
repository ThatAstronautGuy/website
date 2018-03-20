// Example program
#include <iostream>
#include <math.h>
#include <iomanip> 

using namespace std;
#define PI 3.14159265

int main()
{
  double r = 0;
  double g = 0;
  double b = 0;
  double xMult = 0.05;
  double yMult = 0.1;
  double xLoc = 0.65;
  double yLoc = 0.25;
  int numVert = 60;
  int chunks = 360 / numVert;
  for(int i = 0; i < 360; i = i + chunks){
    cout << setprecision(5) << (xMult*sin(i*(PI/180))+xLoc)<< ", " << (yMult*cos(i*(PI/180))+yLoc) << ",\t\t" << r << ", " << g << ", " << b << ", " << endl;
  }
}